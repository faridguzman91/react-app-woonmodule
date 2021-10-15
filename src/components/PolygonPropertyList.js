import React, { useEffect, useState } from "react";
import Accordion from "@material-ui/core/Accordion";
import MuiAccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { Typography, IconButton } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import InputAdornment from "@material-ui/core/InputAdornment";
import styled from "styled-components";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import CenterFocusStrongIcon from "@material-ui/icons/CenterFocusStrong";

const useStyles = makeStyles((theme) => ({
  propertyField: {
    margin: theme.spacing(1),
    width: "100%",
    maxWidth: "350px",
  },
  focusButton: {
    margin: "0 5px",
  },
}));

function PolygonPropertyList(props) {
  const polygon = props.polygon;
  const [properties, setProperties] = useState({
    plotNumber: polygon.plotNumber || "",
    status: polygon.status || "",
    houseType: polygon.houseType || "",
    price: polygon.price || "",
    plotSize: polygon.plotSize || "",
    houseSize: polygon.houseSize || "",
    url: polygon.url || "",
  });

  const handleChange = (prop) => (event) => {
    setProperties({ ...properties, [prop]: event.target.value });
    props.updatePolygonProperties(polygon, {
      ...properties,
      [prop]: event.target.value,
    });
  };

  const classes = useStyles();

  const AccordionSummary = withStyles({
    root: {
      backgroundColor: props.selected
        ? polygon.status === "red"
          ? "rgba(252, 100, 35, 0.2)"
          : polygon.status === "green"
          ? "rgba(0, 207, 138, 0.2)"
          : polygon.status === "yellow"
          ? "rgba(217, 205, 72, 0.2)"
          : "rgba(60, 141, 207, 0.2)"
        : "rgba(0, 0, 0, .03)",
      borderBottom: "1px solid rgba(0, 0, 0, .125)",
    },
    content: {
      "&$expanded": {
        margin: "5px 0",
      },
      alignItems: "center",
      margin: "0",
    },
    expanded: {
      margin: "5px 0",
    },
  })(MuiAccordionSummary);

  const [expanded, setExpanded] = useState(props.selected);
  useEffect(() => {
    setExpanded(props.selected);
  }, [props.selected]);

  useEffect(() => {
    setProperties({
      plotNumber: props.polygon.plotNumber || "",
      status: props.polygon.status || "",
      houseType: props.polygon.houseType || "",
      price: props.polygon.price || "",
      plotSize: props.polygon.plotSize || "",
      houseSize: props.polygon.houseSize || "",
      url: props.polygon.url || "",
    });
  }, [props.polygon]);

  const handleExpand = () => (event, isExpanded) => {
    setExpanded(!!isExpanded);
  };

  return (
    <Accordion expanded={expanded} onChange={handleExpand()}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>{`${props.new ? "New " : ""}Polygon ${
          properties.plotNumber
        }`}</Typography>
        <IconButton
          aria-label="focus"
          className={classes.focusButton}
          onClick={() => props.focusPlot && props.focusPlot(polygon.id)}
        >
          <CenterFocusStrongIcon fontSize="small" />
        </IconButton>
      </AccordionSummary>
      <AccordionDetails>
        <PropertyList>
          <TextField
            className={classes.propertyField}
            onChange={handleChange("plotNumber")}
            label="Plot #"
            value={properties.plotNumber}
          />
          <TextField
            className={classes.propertyField}
            onChange={handleChange("houseType")}
            label="House Type"
            value={properties.houseType}
          />
          <TextField
            className={classes.propertyField}
            onChange={handleChange("price")}
            label="Price"
            value={properties.price}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">€</InputAdornment>
              ),
            }}
          />

          <FormControl className={classes.propertyField}>
            <InputLabel shrink id="demo-simple-select-placeholder-label-label">
              Status
            </InputLabel>
            <Select
              labelId="demo-simple-select-placeholder-label-label"
              id="demo-simple-select-placeholder-label"
              value={properties.status}
              onChange={handleChange("status")}
            >
              <MenuItem value={"green"}>Green</MenuItem>
              <MenuItem value={"yellow"}>Yellow</MenuItem>
              <MenuItem value={"red"}>Red</MenuItem>
            </Select>
          </FormControl>

          <TextField
            className={classes.propertyField}
            onChange={handleChange("plotSize")}
            label="Plot size"
            value={properties.plotSize}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  m<sup>2</sup>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            className={classes.propertyField}
            onChange={handleChange("houseSize")}
            label="House size"
            value={properties.houseSize}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  m<sup>2</sup>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            className={classes.propertyField}
            onChange={handleChange("url")}
            value={properties.url}
            label="URL info"
          />
        </PropertyList>
      </AccordionDetails>
    </Accordion>
  );
}

export default PolygonPropertyList;

const PropertyList = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0 10px 0 0;
`;
