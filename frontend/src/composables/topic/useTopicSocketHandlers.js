import { useTopicSocketNotifications } from "../useSocketNotifications";
import { useToastHelper } from "../useToastHelper";
import { useUserStore } from "../../stores/user";
import { storeToRefs } from "pinia";
import router from "../../router";

export const useTopicSocketHandlers = (topicsStore, postsStore, authStore) => {
  const { showSuccess } = useToastHelper();
  const userStore = useUserStore();
  const { canPost, isBlocked } = storeToRefs(topicsStore);

  const handleNewPost = async (data) => {
    const postExists = postsStore.posts.find((p) => p._id === data.post._id);
    const isOwnPost = data.post.author._id === authStore.user?._id;

    if (isOwnPost && postsStore.waitingForOwnPost) {
      postsStore.waitingForOwnPost = false;
      postsStore.ownPostId = data.post._id;

      if (postsStore.pagination.hasNextPage) {
        await postsStore.fetchPosts(
          data.post.topic,
          postsStore.pagination.page + 1,
          postsStore.pagination.limit,
        );

        userStore.saveLastViewedPage(
          data.post.topic,
          postsStore.pagination.page,
        );
      } else if (!postExists) {
        postsStore.posts.push(data.post);
      }

      setTimeout(() => {
        const postElement = document.querySelector(
          `[data-post-id="${data.post._id}"]`,
        );
        if (postElement) {
          postElement.scrollIntoView({ behavior: "smooth", block: "center" });
          postElement.classList.add("highlight-post");
          setTimeout(
            () => postElement.classList.remove("highlight-post"),
            2000,
          );
        }
      }, 100);
    } else if (!postExists) {
      if (!postsStore.pagination.hasNextPage) {
        postsStore.posts.push(data.post);
      }
    }
  };

  const handlePostLiked = (data) => {
    const post = postsStore.posts.find((p) => p._id === data.postId);
    if (!post) return;

    if (!post.likes) post.likes = [];

    const isCurrentUser = data.userId === authStore.user?._id;

    if (!isCurrentUser) return;

    const userIdIndex = post.likes.findIndex(
      (like) =>
        like &&
        (like._id === authStore.user._id || like === authStore.user._id),
    );

    if (data.isLiked && userIdIndex === -1) {
      post.likes.push(authStore.user._id);
    } else if (!data.isLiked && userIdIndex !== -1) {
      post.likes.splice(userIdIndex, 1);
    }
  };

  const handleNewSubtopic = (data) => {
    const exists = topicsStore.subtopics.find((s) => s._id === data.topic._id);
    if (!exists) {
      topicsStore.subtopics.push(data.topic);
    }
  };

  const handlePostDeleted = (data) => {
    const index = postsStore.posts.findIndex((p) => p._id === data.postId);
    if (index !== -1) {
      postsStore.posts.splice(index, 1);
    }
  };

  const handleTopicClosed = async (data) => {
    if (topicsStore.currentTopic) {
      topicsStore.currentTopic.isClosed = true;
      await topicsStore.fetchTopicDetails(topicsStore.currentTopic._id);
    }
  };

  const handleTopicOpened = async (data) => {
    if (topicsStore.currentTopic) {
      topicsStore.currentTopic.isClosed = false;
      await topicsStore.fetchTopicDetails(topicsStore.currentTopic._id);
    }
  };

  const handleTopicHidden = async (data) => {
    if (topicsStore.currentTopic) {
      topicsStore.currentTopic.isHidden = true;
      if (authStore.user?.role !== "admin") {
        showSuccess("Temat został ukryty przez administratora");
        router.push("/");
      }
    }
  };

  const handleTopicUnhidden = async (data) => {
    if (topicsStore.currentTopic) {
      topicsStore.currentTopic.isHidden = false;
      await topicsStore.fetchTopicDetails(topicsStore.currentTopic._id);
    }
  };

  const handleModeratorAdded = async (data) => {
    if (
      topicsStore.currentTopic &&
      data.topicId === topicsStore.currentTopic._id
    ) {
      await topicsStore.fetchTopicDetails(data.topicId);
    }
  };

  const handleModeratorRemoved = async (data) => {
    if (
      topicsStore.currentTopic &&
      data.topicId === topicsStore.currentTopic._id
    ) {
      await topicsStore.fetchTopicDetails(data.topicId);
    }
  };

  const handleUserBlockedInTopic = async (data) => {
    if (data.userId === authStore.user?._id) {
      canPost.value = false;
      isBlocked.value = true;

      if (topicsStore.currentTopic) {
        await topicsStore.fetchTopicDetails(topicsStore.currentTopic._id);
      }
    }
  };

  const handleUserUnblockedInTopic = async (data) => {
    if (data.userId === authStore.user?._id) {
      canPost.value = true;
      isBlocked.value = false;

      if (topicsStore.currentTopic) {
        await topicsStore.fetchTopicDetails(topicsStore.currentTopic._id);
      }
    }
  };

  const setupSocketListeners = (topicId) => {
    const handlers = {
      onNewPost: handleNewPost,
      onPostLiked: handlePostLiked,
      onNewSubtopic: handleNewSubtopic,
      onPostDeleted: handlePostDeleted,
      onTopicClosed: handleTopicClosed,
      onTopicOpened: handleTopicOpened,
      onTopicHidden: handleTopicHidden,
      onTopicUnhidden: handleTopicUnhidden,
      onModeratorAdded: handleModeratorAdded,
      onModeratorRemoved: handleModeratorRemoved,
      onUserBlockedInTopic: handleUserBlockedInTopic,
      onUserUnblockedInTopic: handleUserUnblockedInTopic,
    };

    useTopicSocketNotifications(topicId, handlers);

    return () => {};
  };

  return {
    setupSocketListeners,
  };
};
