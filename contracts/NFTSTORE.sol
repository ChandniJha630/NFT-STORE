// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

// Import the necessary OpenZeppelin libraries for ERC721 and URI storage extensions.
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

// Define the NFTSTORE contract that inherits from ERC721URIStorage
contract NFTSTORE is ERC721URIStorage {
    
    // State variables
    address payable public marketPlaceOwner; // The owner of the marketplace, set to the deployer's address
    uint256 public listingFeePercent=20;        // The percentage of each sale that goes to the marketplace owner
    uint256 private currentTokenId;          // Tracks the current token ID for minting new tokens
    uint256 private totalItemsSold;          // Tracks the number of items sold on the marketplace

    // Define a structure for NFT listings on the marketplace
    struct NFTListing {
        uint256 tokenId;
        address payable owner;
        address payable seller;
        uint256 price;
    }
    
    // Mapping to store listings for each token ID
    mapping (uint256 => NFTListing) private tokenIdToListing;

    // Modifier to restrict certain functions to only the marketplace owner
    modifier onlyOwner {
        require(msg.sender == marketPlaceOwner, "Only owner can call this function");
        _;
    }

    // Constructor to initialize the contract with the marketplace owner's address
    constructor() ERC721("NFTSTORE", "NFTS") {
        marketPlaceOwner = payable(msg.sender); // Assigns the owner of the marketplace as the deployer
    }

    // Function to update the marketplace listing fee percentage
    function updateListingFeePercent(uint256 _listingFeePercent) public onlyOwner {
        listingFeePercent = _listingFeePercent; // Sets the new listing fee percentage
    }

    // Function to retrieve the current listing fee percentage
    function getListingFeePercent() public view returns (uint256) {
        return listingFeePercent; // Returns the marketplace listing fee percentage
    }

    // Function to get the current token ID
    function getCurrentTokenId() public view returns (uint256) {
        return currentTokenId; // Returns the current token ID (i.e., total NFTs minted so far)
    }

    // Function to retrieve NFT listing information for a specific token ID
    function getNFTListing(uint256 _tokenId) public view returns (NFTListing memory) {
        return tokenIdToListing[_tokenId]; // Returns the listing details for the given token ID
    }

    // Function to create a new NFT token and list it for sale
    function createToken(string memory _tokenURI, uint256 _price) public returns (uint256) {
        require(_price > 0, "Price must be greater than 0"); // Checks that the price is positive
        currentTokenId++; // Increment the token ID for the new token
        uint256 newTokenId = currentTokenId; // Assigns the incremented token ID to newTokenId
        
        // Mint the new token for the caller and set the token URI
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);
        
        // Creates a new listing for the minted token with the specified price
        _createNFTListing(newTokenId, _price);
        return newTokenId; // Returns the new token ID
    }

    // Private function to create a listing for an NFT
    function _createNFTListing(uint256 _tokenId, uint256 _price) private {
        // Creates a new NFT listing in the mapping with owner and seller set to the caller's address
        tokenIdToListing[_tokenId] = NFTListing({
            tokenId: _tokenId,
            owner: payable(msg.sender),
            seller: payable(msg.sender),
            price: _price
        });
    }

    // Function to execute the sale of an NFT
    function executeSale(uint256 tokenId) public payable {
        // Retrieves the NFT listing details for the token ID
        NFTListing storage listing = tokenIdToListing[tokenId];
        uint256 price = listing.price; // Gets the price of the NFT
        address payable seller = listing.seller; // Gets the seller's address
        
        // Ensures the buyer has sent the correct amount
        require(msg.value == price, "Please submit the asking price to complete the purchase");
        
        listing.seller = payable(msg.sender); // Update the seller to the buyer
        totalItemsSold++; // Increment the total items sold counter
        
        // Transfer the NFT ownership from the seller to the buyer
        _transfer(listing.owner, msg.sender, tokenId);
        
        // Calculate the marketplace fee and send it to the marketplace owner
        uint256 listingFee = (price * listingFeePercent) / 100;
        marketPlaceOwner.transfer(listingFee); // Transfer the listing fee to the owner
        
        // Transfer the remaining amount to the original seller
        seller.transfer(msg.value - listingFee);
    }

    // Function to retrieve all listed NFTs
    function getAllListedNFTs() public view returns (NFTListing[] memory) {
        uint256 totalNFTCount = currentTokenId; // Gets the total number of NFTs created
        NFTListing[] memory listedNFTs = new NFTListing[](totalNFTCount); // Creates an array to store the listings
        uint256 currentIndex = 0; // Keeps track of the current index in the array

        // Loops through all tokens and adds their listings to the array
        for (uint256 i = 0; i < totalNFTCount; i++) {
            uint256 tokenId = i + 1;
            NFTListing storage listing = tokenIdToListing[tokenId];
            listedNFTs[currentIndex] = listing;
            currentIndex += 1;
        }

        return listedNFTs; // Returns the array of listings
    }
    

    // Function to retrieve NFTs owned or listed by the caller
    function getMyNFTs() public view returns (NFTListing[] memory) {
        uint256 totalNFTCount = currentTokenId; // Gets the total number of NFTs created
        uint256 myNFTCount = 0; // Counter for caller's NFTs
        uint256 currentIndex = 0;

        // First loop: Counts the caller's NFTs
        for (uint256 i = 0; i < totalNFTCount; i++) {
            if (tokenIdToListing[i + 1].owner == msg.sender || tokenIdToListing[i + 1].seller == msg.sender) {
                myNFTCount++;
            }
        }

        // Creates an array of the caller's NFTs
        NFTListing[] memory myNFTs = new NFTListing[](myNFTCount);

        // Second loop: Adds the caller's NFTs to the array
        for (uint256 i = 0; i < totalNFTCount; i++) {
            if (tokenIdToListing[i + 1].owner == msg.sender || tokenIdToListing[i + 1].seller == msg.sender) {
                uint256 tokenId = i + 1;
                NFTListing storage listing = tokenIdToListing[tokenId];
                myNFTs[currentIndex] = listing;
                currentIndex++;
            }
        }

        return myNFTs; // Returns the array of the caller's NFTs
    }
}
