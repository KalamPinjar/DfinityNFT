import React from "react";
import Item from "./Item";
import { useState, useEffect } from "react";
import { Principal } from "@dfinity/principal";

function Gallery(props) {
  const [items, setItems] = useState();

  function loadItems() {
    if (props.ids != undefined) {
      setItems(
        props.ids.map((id) => {
          return <Item id={id} key={id.toText()} role={props.role} />;
        })
      );
    }
  }

  useEffect(() => {
    loadItems();
  }, []);
  return (
    <div className="gallery-view">
      <h3 className="makeStyles-title-99 Typography-h3">{props.title}</h3>
      <div className="disGrid-root disGrid-container disGrid-spacing-xs-2">
        <div className="disGrid-root disGrid-item disGrid-grid-xs-12">
          <div className="disGrid-root disGrid-container disGrid-spacing-xs-5 disGrid-justify-content-xs-center">
            {items}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Gallery;
