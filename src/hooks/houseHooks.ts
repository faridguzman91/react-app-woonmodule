import { useEffect, useState } from "react";
import { loadImageDownloadUrl } from "../persistence/persistence";
import { CustomImage } from "../dto/CustomImage";

export const useLoadImages = (
  listImages: CustomImage[]
): [CustomImage[], (listImages: CustomImage[]) => void] => {
  const [refreshObj, refresh] = useState<object>({});
  const [imageList, setImageList] = useState<CustomImage[]>(listImages);

  useEffect(() => {
    const loadImageList = async (imagesIds: string[] | undefined) => {
      const result: CustomImage[] = [];
      if (imagesIds) {
        for (const id of imagesIds) {
          if (!id) {
            return;
          }
          const imgDownLoadUrl = await loadImageDownloadUrl(id);
          if (imgDownLoadUrl) {
            const img: CustomImage = { id: id };
            img.dataURL = imgDownLoadUrl;
            result.push(img);
          }
        }
      }
      setImageList(result);
    };

    if (imageList.length > 0) {
      const imagesIds: string[] = [];
      for (const image of imageList!) {
        imagesIds.push(image.id);
      }
      loadImageList(imagesIds);
    }
  }, [refreshObj]);

  return [
    imageList,
    (listImages: CustomImage[]) => {
      setImageList(listImages);
      refresh({});
    },
  ];
};
