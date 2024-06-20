import React, { useState, useEffect } from "react";
import logo from "../../../../assets/logo.png";
import { Actor, HttpAgent } from "@dfinity/agent";
import { canisterId, idlFactory } from "../../../declarations/NFT";
import { idlFactory as tokenidlFactory } from "../../../declarations/token-local-new-backend";
import { Principal } from "@dfinity/principal";
import { NFT_project_backend as NFT } from "../../../declarations/NFT_project_backend";
import Button from "./Buttton";
import CURRENT_USER_ID from "..";
import PriceLabel from "./PriceLabel";

function Item(props) {
  const [name, setName] = useState("");
  const [owner, setOwner] = useState("");
  const [image, setImage] = useState(null);
  const [button, setButton] = useState();
  const [priceInput, setPriceInput] = useState(null);
  const [blur, setBlur] = useState();
  const [sellStatus, setSellStatus] = useState("");
  const [loaderHidden, setLoaderHidden] = useState(true);
  const [priceLabel, setPriceLabel] = useState();
  const [displayNFT, setDisplayNFT] = useState(true);

  const id = props.id;
  const localhost = "http://localhost:3000/";

  const agent = new HttpAgent({ host: localhost });

  agent.fetchRootKey();
  // .then(() => {
  //   console.log("Root key loaded");
  // })
  // .catch((err) => {
  //   console.warn(
  //     "Unable to fetch root key. Check to ensure that your local replica is running"
  //   );
  //   console.error(err);
  // });
  let NFTActor;
  const loadNFT = async () => {
    NFTActor = await Actor.createActor(idlFactory, {
      agent,
      canisterId: id,
    });
    const name = await NFTActor.getName();
    const owner = await NFTActor.getOwner();
    const imgData = await NFTActor.getAsset();
    const imgContent = new Uint8Array(imgData);
    const img = URL.createObjectURL(
      new Blob([imgContent.buffer], { type: "image/png" })
    );
    setName(name);
    setOwner(owner.toText());
    setImage(img);

    if (props.role == "collection") {
      const NFTisListed = await NFT.isListed(props.id);
      if (NFTisListed) {
        setOwner("DfinityNFT");
        setBlur({ filter: "blur(4px)" });
        setSellStatus("Listed");
        setButton();
        setPriceInput();
      } else {
        setButton(<Button handleOnClick={sellNFT} text={"Sell"} />);
      }
    } else if (props.role == "discover") {
      const originalOwner = await NFT.getOriginalOwner(props.id);
      if (originalOwner.toText() != CURRENT_USER_ID.toText()) {
        setButton(<Button handleOnClick={buyNFT} text={"Buy"} />);
      }

      const price = await NFT.getListedNFTPrice(props.id);
      setPriceLabel(<PriceLabel sellPrice={price.toString()} />);
    }
  };

  useEffect(() => {
    loadNFT();
  }, []);

  let price;

  async function buyNFT() {
    setLoaderHidden(false);
    console.log("Buying NFT");
    const tokenActor = await Actor.createActor(tokenidlFactory, {
      agent,
      canisterId: Principal.fromText("dzh22-nuaaa-aaaaa-qaaoa-cai"),
    });
    const sellerId = await NFT.getOriginalOwner(props.id);
    const itemPrice = await NFT.getListedNFTPrice(props.id);

    const result = await tokenActor.transfer(sellerId, itemPrice);
    if (result == "Success") {
      const transferResult = await NFT.completePurchase(
        props.id,
        sellerId,
        CURRENT_USER_ID
      );
      console.log("Purchased NFT: " + transferResult);
      setLoaderHidden(true);
      setDisplayNFT(false);
    }
  }
  function sellNFT() {
    setPriceInput(
      <input
        placeholder="Price in KAR"
        type="number"
        className="price-input"
        value={price}
        onChange={(e) => {
          price = e.target.value;
        }}
      />
    );

    setButton(<Button handleOnClick={confirmSellNFT} text={"Confirm"} />);
  }

  async function confirmSellNFT() {
    setLoaderHidden(false);
    const result = await NFT.listItems(props.id, Number(price));

    if (result === "Success") {
      const NFTid = await NFT.getNFTCanisterID();
      const transfer = await NFTActor.transferOwnership(NFTid);
      console.log(transfer);

      if (transfer === "Success") {
        setLoaderHidden(true);
        setButton();
        setPriceInput();
        setSellStatus("Listed");
        setBlur({ filter: "blur(4px)" });
        setOwner("DfinityNFT");
        console.log(result);
      }
    } else {
      setLoaderHidden(true);
      setButton();
      setPriceInput();
      setBlur({ filter: "blur(4px)" });
      setOwner("DfinityNFT");
      console.log(result);
    }
  }

  return (
    <div
      style={{ display: displayNFT ? "inline" : "none" }}
      className="disGrid-item"
    >
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={image}
          alt={name}
          style={blur}
        />
        <div className="lds-ellipsis" hidden={loaderHidden}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className="disCardContent-root">
          {priceLabel}
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name}
            <span className="purple-text"> {sellStatus}</span>
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            Owner: {owner}
          </p>
          {priceInput}
          {button}
        </div>
      </div>
    </div>
  );
}

export default Item;
