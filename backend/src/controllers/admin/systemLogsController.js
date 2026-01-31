const SystemLogs = require("../../models/SystemLogs");
const {
  ACTION_TYPES,
  ACTION_LABELS,
} = require("../../utils/constants/actionTypes");
const paginationService = require("../../services/paginationService");

exports.getSystemLogs = async (req, res) => {
  try {
    const { page, limit, skip } = paginationService.getPaginationParams(
      req.query,
      20,
    );

    const filter = {};
    if (req.query.actionType) filter.actionType = req.query.actionType;
    if (req.query.performer) filter.performer = req.query.performer;

    const logs = await SystemLogs.find(filter)
      .populate("performer", "username email")
      .populate("targetUser", "username email")
      .populate("targetTopic", "name")
      .sort("-createdAt")
      .skip(skip)
      .limit(limit + 1)
      .lean();

    const { items: results, pagination } = paginationService.formatResponse(
      logs,
      page,
      limit,
    );

    const logsWithLabels = results.map((log) => ({
      ...log,
      actionLabel: ACTION_LABELS[log.actionType] || log.actionType,
    }));

    res.status(200).json({
      status: "success",
      results: logsWithLabels.length,
      data: {
        logs: logsWithLabels,
        pagination,
        actionTypes: ACTION_TYPES,
        actionLabels: ACTION_LABELS,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
