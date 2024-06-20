import React, { useEffect, useState } from "react";
import logo from "../../../../assets/logo.png";
import { BrowserRouter as Router, Link, Switch, Route } from "react-router-dom";
import homeImage from "../../../../assets/home-img.png";
import Minter from "./Minter";
import Gallery from "./Gallery";
import { NFT_project_backend as mainNFT } from "../../../declarations/NFT_project_backend";
import CURRENT_USER_ID from "..";

function Header() {
  const [userOwnedGallery, setUserGallery] = useState();
  const [DfinityNFTOwnedGallery, setDfinityNFTGallery] = useState();
  async function getNFTs() {
    const userNFTsIDs = await mainNFT.getOwnedNFT(CURRENT_USER_ID);
    // console.log(userNFTsIDs);
    setUserGallery(
      <Gallery title="My NFTs" ids={userNFTsIDs} role="collection" />
    );

    const DfinityNFTsIDs = await mainNFT.getListedNFT();
    // console.log(DfinityNFTsIDs);
    setDfinityNFTGallery(
      <Gallery title="Discover" ids={DfinityNFTsIDs} role="discover" />
    );
  }

  useEffect(() => {
    getNFTs();
  }, []);

  return (
    <Router forceRefresh={true}>
      <div className="app-root-1">
        <header className="Paper-root AppBar-root AppBar-positionStatic AppBar-colorPrimary Paper-elevation4">
          <div className="Toolbar-root Toolbar-regular header-appBar-13 Toolbar-gutters">
            <div className="header-left-4"></div>
            <img className="header-logo-11" src={logo} />
            <div className="header-vertical-9"></div>
            <Link to="/">
              <h5 className="Typography-root header-logo-text">DfinityNFT</h5>
            </Link>
            <div className="header-empty-6"></div>
            <div className="header-space-8"></div>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to="/discover">Discover</Link>
            </button>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to="/minter">Minter</Link>
            </button>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to="/collection">My NFTs</Link>
            </button>
          </div>
        </header>
      </div>
      <Switch>
        <Route exact path="/">
          {" "}
          <img className="bottom-space" src={homeImage} />
        </Route>
        <Route path="/discover">{DfinityNFTOwnedGallery}</Route>
        <Route path="/minter">
          <Minter />
        </Route>
        <Route path="/collection">{userOwnedGallery}</Route>
      </Switch>
    </Router>
  );
}

export default Header;
