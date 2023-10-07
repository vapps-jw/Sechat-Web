type VideoProcessingResult = {
  success: boolean;
  errorMessage?: string;
  thumbnail?: string;
  video?: string;
};

export const useVideoApi = () => {
  const config = useRuntimeConfig();

  const processChatVideo = async (
    file: File
  ): Promise<VideoProcessingResult> => {
    const formData = new FormData();
    formData.append("video", file);
    const { error: apiError, data: processedImage } =
      await useFetch<VideoProcessingResult>(
        `${config.public.apiBase}/videos/process-chat-video`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

    if (apiError.value) {
      const result: VideoProcessingResult = {
        success: false,
        errorMessage: apiError.value.data,
      };
      return result;
    }
    const result: VideoProcessingResult = {
      success: true,
      thumbnail: processedImage.value.thumbnail,
      video: processedImage.value.video,
    };

    return result;
  };

  return {
    processChatVideo,
  };
};
