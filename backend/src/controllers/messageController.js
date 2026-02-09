const Message = require("../models/Message");
const User = require("../models/User");
const authService = require("../services/authorizationService");
const notificationService = require("../services/notificationService");
const paginationService = require("../services/paginationService");

exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const isAdmin = authService.isAdmin(req.user);

    let matchStage;

    if (isAdmin) {
      matchStage = {
        conversationId: { $regex: "^support_" },
      };
    } else {
      matchStage = {
        conversationId: `support_${userId}`,
      };
    }

    const messages = await Message.aggregate([
      { $match: matchStage },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$conversationId",
          lastMessage: { $first: "$$ROOT" }, //podgląd ostatniej wiadomości
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$sender", req.user._id] },
                    { $eq: ["$read", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $sort: { "lastMessage.createdAt": -1 },
      },
    ]);

    const conversations = await Promise.all(
      messages.map(async (conv) => {
        const chatPartnerId = conv._id.replace("support_", "");

        let otherUser = null;
        if (isAdmin) {
          otherUser = await User.findById(chatPartnerId).select(
            "username email avatar",
          );
        } else {
          const lastMsg = conv.lastMessage;
          const adminId =
            lastMsg.sender.toString() === userId.toString()
              ? lastMsg.receiver
              : lastMsg.sender;

          if (adminId) {
            otherUser = await User.findById(adminId).select(
              "username email avatar role",
            );
          }

          if (!otherUser) {
            otherUser = {
              _id: "support",
              username: "Wsparcie ProgTalk",
              role: "system",
            };
          }
        }

        return {
          conversationId: conv._id,
          otherUser,
          lastMessage: {
            content: conv.lastMessage.content,
            createdAt: conv.lastMessage.createdAt,
            isFromMe: conv.lastMessage.sender.toString() === userId.toString(),
          },
          unreadCount: conv.unreadCount,
        };
      }),
    );

    res.status(200).json({
      status: "success",
      data: { conversations },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const isAdmin = authService.isAdmin(req.user);
    const { recipientId } = req.params;

    const targetUserId = isAdmin ? recipientId : userId;

    const conversationId = `support_${targetUserId}`;

    const { page, limit, skip } = paginationService.getPaginationParams(
      req.query,
      50,
    );

    const messages = await Message.find({ conversationId })
      .populate("sender", "username avatar role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    await Message.updateMany(
      {
        conversationId,
        read: false,
        sender: { $ne: userId },
      },
      { read: true },
    );

    res.status(200).json({
      status: "success",
      data: {
        messages: messages.reverse(), //odrwacamy kolejnosc najnowsze na koniec
        pagination: {
          page,
          limit,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const { recipientId } = req.params;

    const senderId = req.user._id;
    const isAdmin = authService.isAdmin(req.user);

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Pusta wiadomość" });
    }

    let conversationId;
    let receiverId = null;

    if (isAdmin) {
      if (!recipientId)
        return res.status(400).json({ message: "Komu odpisujesz?" });
      conversationId = `support_${recipientId}`;
      receiverId = recipientId;
    } else {
      conversationId = `support_${senderId}`;
      // receiverId może być null jeśli nie ma admina, wiadomość i tak zostanie zapisana
      let adminId =
        recipientId && recipientId !== "support" ? recipientId : null;

      if (!adminId) {
        const existingMsg = await Message.findOne({ conversationId }).populate(
          "sender receiver",
        );
        if (existingMsg) {
          const otherUser =
            existingMsg.sender._id.toString() === senderId.toString()
              ? existingMsg.receiver
              : existingMsg.sender;
          if (otherUser && otherUser.role === "admin") {
            adminId = otherUser._id;
          }
        }
      }

      if (!adminId) {
        const firstAdmin = await User.findOne({
          role: "admin",
          status: "approved",
        });
        if (firstAdmin) {
          adminId = firstAdmin._id;
        }
      }

      if (adminId) {
        const recipient = await User.findById(adminId);
        if (recipient && recipient.role === "admin") {
          receiverId = adminId;
        }
      }
    }

    const message = await Message.create({
      conversationId,
      sender: senderId,
      receiver: receiverId,
      content: content.trim(),
    });

    const populatedMsg = await Message.findById(message._id)
      .populate("sender", "username avatar role")
      .populate("receiver", "username avatar role");

    if (isAdmin) {
      if (receiverId) {
        notificationService.notifyNewMessage(receiverId, populatedMsg);
      }
    } else {
      notificationService.notifySupportMessage(populatedMsg);
      if (receiverId) {
        notificationService.notifyNewMessage(receiverId, populatedMsg);
      }
    }

    notificationService.notifyMessageSent(senderId, populatedMsg);

    res
      .status(201)
      .json({ status: "success", data: { message: populatedMsg } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const isAdmin = authService.isAdmin(req.user);

    const targetUserId = isAdmin ? req.params.recipientId : userId;
    const conversationId = `support_${targetUserId}`;

    await Message.updateMany(
      {
        conversationId,
        read: false,
        sender: { $ne: userId },
      },
      { read: true },
    );

    res.status(200).json({
      status: "success",
      message: "Wiadomości oznaczone jako przeczytane.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const isAdmin = authService.isAdmin(req.user);

    let count = 0;

    if (isAdmin) {
      count = await Message.countDocuments({
        receiver: userId,
        read: false,
      });
    } else {
      count = await Message.countDocuments({
        conversationId: `support_${userId}`,
        sender: { $ne: userId },
        read: false,
      });
    }

    res.status(200).json({
      status: "success",
      data: { unreadCount: count },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
