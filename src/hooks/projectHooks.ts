import { useEffect, useState } from "react";
import {
  loadAllProjects,
  loadImageDownloadUrl,
  loadProject,
} from "../persistence/persistence";
import { ProjectDto } from "../dto";
import { convertImageJsonToMap } from "../utils/imageUtils";

export const useProjects = (): [
  { projects: ProjectDto[]; isError: boolean; isLoading: boolean },
  () => void
] => {
  const [data, setData] = useState<ProjectDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [refreshObject, refreshData] = useState<object>({});

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const resp: ProjectDto[] = (await loadAllProjects()).map((d) => {
          const project = d.data();
          return {
            id: d.id,
            name: project.name || "note set",
            houses: convertImageJsonToMap(project.houses) || [],
            guideLines: project.guideLines || [],
            ariaViewImageId: project.ariaViewImageId,
            ariaPreViewImage: project.ariaPreViewImage,
            isDisabled: project.isDisabled,
            creationDate: project.creationDate,
            houseTypes: project.houseTypes || [],
            houseAdditionalProperties: project.houseAdditionalProperties || [],
          };
        });
        setData([...resp]);
      } catch (e) {
        setIsError(true);
      }
      setIsLoading(false);
    };
    fetchProjects();
  }, [refreshObject]);
  data.sort((a, b) => a.creationDate - b.creationDate).reverse();
  return [{ projects: data, isLoading, isError }, () => refreshData({})];
};

export const useProject = (
  id: string
): [
  { project: ProjectDto | null; isError: boolean; isLoading: boolean },
  (id: string) => void
] => {
  const [projectId, setProjectId] = useState<string>(id);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [data, setData] = useState<ProjectDto | null>(null);
  const [isError, setIsError] = useState<boolean>(false);
  const [refreshObj, refresh] = useState<object>({});

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setIsLoading(true);
        let resp = await loadProject(projectId);
        if (resp) {
          const ariaPreViewImage = await loadImageDownloadUrl(
            resp.ariaViewImageId
          );
          const project: ProjectDto = {
            id: projectId,
            houses: convertImageJsonToMap(resp.houses),
            ariaViewImageId: resp.ariaViewImageId,
            ariaPreViewImage: ariaPreViewImage,
            name: resp.name,
            isDisabled: resp.isDisabled,
            guideLines: resp.guideLines,
            creationDate: resp.creationDate,
            houseTypes: resp.houseTypes || [],
            houseAdditionalProperties: resp.houseAdditionalProperties || [],
          };
          setData(project);
        }
      } catch (e) {
        setIsError(true);
      }
      setIsLoading(false);
    };
    fetchProject();
  }, [refreshObj]);
  return [
    { project: data, isLoading, isError },
    (id: string) => {
      setProjectId(id);
      refresh({});
    },
  ];
};
