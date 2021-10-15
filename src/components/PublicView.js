import React, { useEffect, useState } from "react";
import MapPreview from "./MapPreview";
import { useParams } from "react-router-dom";
import { loadImageDownloadUrl, loadProject } from "../persistence/persistence";

function PublicView(props) {
  let { id } = useParams();
  const [aerialView, setAerialView] = useState(null);
  const [editorSettings, setEditorSettings] = useState(null);

  const [savedPolygons, setSavedPolygons] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const savedData = await loadProject(id);

      if (savedData) {
        setSavedPolygons(savedData.polygons);
      } else {
        console.info("No polygon data in DB");
      }

      if (savedData.editorSettings) {
        setEditorSettings(savedData.editorSettings);
      } else {
        setEditorSettings({
          strokeWidth: 1,
          cornersRadius: 0,
          strokeColor: "#ffffff",
        });
      }

      const aerialImageUrl = await loadImageDownloadUrl(id);
      if (aerialImageUrl) {
        setAerialView(aerialImageUrl);
      } else {
        console.info("Image file doesn't exist in Firebase");
      }
    }
    fetchData();
  }, [id]);

  return (
    <div className="PublicView">
      {aerialView ? (
        <MapPreview
          editorSettings={editorSettings}
          aerialView={aerialView}
          savedPolygons={savedPolygons}
        />
      ) : (
        "Loading ..."
      )}
    </div>
  );
}

export default PublicView;
