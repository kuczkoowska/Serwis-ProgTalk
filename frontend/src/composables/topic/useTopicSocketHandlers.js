import { useTopicSocketNotifications } from "../useSocketNotifications";
import { useUserStore } from "../../stores/user";
import router from "../../router";

export const useTopicSocketHandlers = (topicsStore, postsStore, authStore) => {
  const userStore = useUserStore();

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

    post.likesCount = data.likesCount;
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

  const handleTopicClosed = (data) => {
    if (
      topicsStore.currentTopic &&
      data.topicId === topicsStore.currentTopic._id
    ) {
      topicsStore.currentTopic.isClosed = true;
      topicsStore.isClosed = true;
      topicsStore.canPost = false;
    }
  };

  const handleTopicOpened = (data) => {
    if (
      topicsStore.currentTopic &&
      data.topicId === topicsStore.currentTopic._id
    ) {
      topicsStore.currentTopic.isClosed = false;
      topicsStore.isClosed = false;
      if (!topicsStore.isBlocked) {
        topicsStore.canPost = true;
      }
    }
  };

  const handleTopicHidden = (data) => {
    if (
      topicsStore.currentTopic &&
      data.topicId === topicsStore.currentTopic._id
    ) {
      topicsStore.currentTopic.isHidden = true;
      if (authStore.user?.role !== "admin") {
        router.push("/");
      }
    }
  };

  const handleTopicUnhidden = (data) => {
    if (
      topicsStore.currentTopic &&
      data.topicId === topicsStore.currentTopic._id
    ) {
      topicsStore.currentTopic.isHidden = false;
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

  const handleUserBlockedInTopic = (data) => {
    if (
      data.userId === authStore.user?._id &&
      topicsStore.currentTopic &&
      data.topicId === topicsStore.currentTopic._id
    ) {
      topicsStore.canPost = false;
      topicsStore.isBlocked = true;
    }
  };

  const handleUserUnblockedInTopic = (data) => {
    if (
      data.userId === authStore.user?._id &&
      topicsStore.currentTopic &&
      data.topicId === topicsStore.currentTopic._id
    ) {
      topicsStore.canPost = true;
      topicsStore.isBlocked = false;
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
