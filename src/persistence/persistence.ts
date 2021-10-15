import { db, storage } from "./firebase";
import { ProjectDto } from "../dto";
import { convertImageMapToJson } from "../utils/imageUtils";
import cloneDeep from "clone-deep";
import {PROJECT_COLLECTION_PATH} from "../constants/constants";

export const loadAllProjects = async () => {
  return (
    await db
      .collection(PROJECT_COLLECTION_PATH!)
      .where("isDisabled", "==", false)
      .get()
  ).docs;
};

export async function saveProject(id: string | undefined, data: ProjectDto) {
  let projectToSave = cloneDeep(data);
  projectToSave.houses = convertImageMapToJson(projectToSave.houses);

  if (!id) {
    const res = await db.collection(PROJECT_COLLECTION_PATH!).add(projectToSave);
    return res.id;
  } else {
    const docRef = await db.collection(PROJECT_COLLECTION_PATH!).doc(id);
    await docRef.set(projectToSave);
    return id;
  }
}

export async function loadProject(id: string) {
  return (await db.collection(PROJECT_COLLECTION_PATH!).doc(id).get()).data();
}

export async function deleteProject(id: string) {
  return await db
    .collection(PROJECT_COLLECTION_PATH!)
    .doc(id)
    .update({ isDisabled: true });
}

export async function saveImage(docId: string | undefined, file: any) {
  if (!docId) {
    throw new Error(
      "Must provide ID for image! Should equal to ID of document in DB"
    );
  }
  const fileRef = storage.ref().child(docId);
  const { name, size, contentType } = file;
  return await new Promise(function (resolve, reject) {
    fileRef
      .put(file, { customMetadata: { name, size }, contentType })
      .then(resolve, reject);
  });
}

export async function loadImageDownloadUrl(
  docId: string
): Promise<string | null> {
  const fileRef = storage.ref().child(docId);
  try {
    return await fileRef.getDownloadURL();
  } catch (e) {
    // file doesn't exist
    return null;
  }
}

export function deleteImage(filePath: string) {
  if (filePath !== "") {
    const ref = storage.ref();
    ref.child(filePath).delete();
  }
}
