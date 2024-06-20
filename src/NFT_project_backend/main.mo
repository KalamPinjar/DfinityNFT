import Text "mo:base/Text";
import Nat8 "mo:base/Nat8";
import Cycle "mo:base/ExperimentalCycles";
import Principal "mo:base/Principal";
import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import List "mo:base/List";
import Bool "mo:base/Bool";
import Iter "mo:base/Iter";
import NFTActorClass "../NFT/nft";

actor NFT_project {

    private type Listing = {
        ItemOwner : Principal;
        ItemPrice : Nat;
    };

    var MapofNFTs = HashMap.HashMap<Principal, NFTActorClass.NFT>(1, Principal.equal, Principal.hash);
    var MapofOwners = HashMap.HashMap<Principal, List.List<Principal>>(1, Principal.equal, Principal.hash);
    var MapofListings = HashMap.HashMap<Principal, Listing>(1, Principal.equal, Principal.hash);

    public shared (msg) func mint(imgData : [Nat8], name : Text) : async Principal {

        let owner : Principal = msg.caller;

        Debug.print(debug_show (Cycle.balance()));
        Cycle.add(100_500_000_000);
        let newNFT = await NFTActorClass.NFT(name, owner, imgData);
        Debug.print(debug_show (Cycle.balance()));

        let newNFTPrincipal = await newNFT.getCanisterID();

        MapofNFTs.put(newNFTPrincipal, newNFT);
        addtoOwnersList(owner, newNFTPrincipal);

        return newNFTPrincipal;
    };

    private func addtoOwnersList(owner : Principal, nftId : Principal) {
        var owneredNFTs : List.List<Principal> = switch (MapofOwners.get(owner)) {
            case null List.nil<Principal>();
            case (?result) result;
        };
        owneredNFTs := List.push(nftId, owneredNFTs);
        MapofOwners.put(owner, owneredNFTs);

    };

    public query func getOwnedNFT(user : Principal) : async [Principal] {
        var userNFTs : List.List<Principal> = switch (MapofOwners.get(user)) {
            case null List.nil<Principal>();
            case (?result) result;
        };

        return List.toArray(userNFTs);
    };

    public query func getListedNFT() : async [Principal] {
        let ids = Iter.toArray(MapofListings.keys());
        return ids;
    };

    public query func getOriginalOwner(id : Principal) : async Principal {
        var listing : Listing = switch (MapofListings.get(id)) {
            case null return Principal.fromText("");
            case (?result) result;

        };

        return listing.ItemOwner;
    };

    public shared (msg) func listItems(id : Principal, price : Nat) : async Text {
        var nftitem : NFTActorClass.NFT = switch (MapofNFTs.get(id)) {
            case null return "NFT doesn't exist";
            case (?result) result;
        };

        let owner : Principal = await nftitem.getOwner();
        if (Principal.equal(owner, msg.caller)) {
            let newListing : Listing = {
                ItemOwner = owner;
                ItemPrice = price;
            };

            MapofListings.put(id, newListing);

            return "Success";

        } else {
            return "You are not the owner of this NFT";
        };

        return "Success";
    };

    public query func getNFTCanisterID() : async Principal {
        return Principal.fromActor(NFT_project);
    };

    public query func isListed(id : Principal) : async Bool {
        if (MapofListings.get(id) == null) {
            return false;
        } else {
            return true;
        };
    };

    public query func getListedNFTPrice(id : Principal) : async Nat {
        var listing : Listing = switch (MapofListings.get(id)) {
            case null return 0;
            case (?result) result;
        };

        return listing.ItemPrice;
    };
    public shared (msg) func completePurchase(id : Principal, owner : Principal, newOwnerId : Principal) : async Text {
        var purchasedNFT : NFTActorClass.NFT = switch (MapofNFTs.get(id)) {
            case null return "NFT doesn't exist";
            case (?result) result;
        };
        let transferResult = await purchasedNFT.transferOwnership(newOwnerId);

        if (transferResult == "Success") {
            MapofListings.delete(id);
            var ownedNFTs : List.List<Principal> = switch (MapofOwners.get(owner)) {
                case null List.nil<Principal>();
                case (?result) result;
            };
            ownedNFTs := List.filter(
                ownedNFTs,
                func(listItemId : Principal) : Bool {
                    return listItemId != id;
                },
            );
            addtoOwnersList(newOwnerId, id);
            return "Success";
        } else {
            return transferResult;
        };

    };
};
