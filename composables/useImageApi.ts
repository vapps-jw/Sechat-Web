type ImageProcessingResult = {
  success: boolean;
  error?: string;
  data?: string;
};

export const useImageApi = () => {
  const config = useRuntimeConfig();

  const processChatImage = async (
    file: File
  ): Promise<ImageProcessingResult> => {
    const formData = new FormData();
    formData.append("image", file);
    const { error: apiError, data: processedImage } =
      await useFetch<ProcessedImageResponse>(
        `${config.public.apiBase}/images/process-chat-image`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

    if (apiError.value) {
      const result: ImageProcessingResult = {
        success: false,
        error: apiError.value.data,
      };
      return result;
    }
    const result: ImageProcessingResult = {
      success: true,
      data: processedImage.value.data,
    };

    return result;
  };

  return {
    processChatImage,
  };
};
