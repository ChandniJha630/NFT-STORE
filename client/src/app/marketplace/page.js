"use client";
import { WalletContext } from "@/context/wallet";
import { useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import MarketplaceJson from "../marketplace.json";
import styles from "./marketplace.module.css";
import Header from "../components/header/header";
import Footer from "../components/footer/footer";
import axios from "axios";
import NFTCard from "../components/NFTCard/NFTCard";

export default function Marketplace() {
  const [items, setItems] = useState();
  const { isConnected, signer } = useContext(WalletContext);

  // async function getNFTitems() {
  //   const itemsArray = [];
  //   if (!signer) return;
  //   let contract = new ethers.Contract(
  //     MarketplaceJson.address,
  //     MarketplaceJson.abi,
  //     signer
  //   );

  //   let transaction = await contract.getAllListedNFTs();

  //   for (const i of transaction) {
  //     const tokenId = parseInt(i.tokenId);
  //     const tokenURI = await contract.tokenURI(tokenId);
  //     const meta = (await axios.get(tokenURI)).data;
  //     const price = ethers.formatEther(i.price);

  //     const item = {
  //       price,
  //       tokenId,
  //       seller: i.seller,
  //       owner: i.owner,
  //       image: meta.image,
  //       name: meta.name,
  //       description: meta.description,
  //     };

  //     itemsArray.push(item);
  //   }
  //   return itemsArray;
  // }
  async function getNFTitems() {
    const itemsArray = [];
    if (!signer) return;
    
    let contract = new ethers.Contract(
      MarketplaceJson.address,
      MarketplaceJson.abi,
      signer
    );
  
    try {
      let transaction = await contract.getAllListedNFTs();
      console.log("Transaction result: ", transaction); // Debugging log
  
      if (!transaction || transaction.length === 0) {
        console.warn("No NFTs returned from the contract");
        return [];
      }
  
      for (const i of transaction) {
        const tokenId = parseInt(i.tokenId);
        const tokenURI = await contract.tokenURI(tokenId);
        const meta = (await axios.get(tokenURI)).data;
        const price = ethers.formatEther(i.price);
  
        const item = {
          price,
          tokenId,
          seller: i.seller,
          owner: i.owner,
          image: meta.image,
          name: meta.name,
          description: meta.description,
        };
  
        itemsArray.push(item);
      }
    } catch (error) {
      console.error("Error fetching NFTs from the contract:", error);  // Improved error handling
    }
  
    return itemsArray;
  }
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const itemsArray = await getNFTitems();
        setItems(itemsArray);
      } catch (error) {
        console.error("Error fetching NFT items:", error);
      }
    };

    fetchData();
  }, [isConnected]);

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.innerContainer}>
        <div className={styles.content}>
          {isConnected ? (
            <>
              <div className={styles.nftSection}>
                <h2 className={styles.heading}>NFT Marketplace</h2>
                {items?.length > 0 ? (
                  <div className={styles.nftGrid}>
                    {items?.map((value, index) => (
                      <NFTCard item={value} key={index} />
                    ))}
                  </div>
                ) : (
                  <div className={styles.noNFT}>No NFT Listed Now...</div>
                )}
              </div>
            </>
          ) : (
            <div className={styles.notConnected}>You are not connected...</div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
 }
// "use client";
// import { WalletContext } from "@/context/wallet";
// import { useContext, useEffect, useState } from "react";
// import { ethers } from "ethers";
// import MarketplaceJson from "../marketplace.json";
// import styles from "./marketplace.module.css";
// import Header from "../components/header/header";
// import Footer from "../components/footer/footer";
// import axios from "axios";
// import NFTCard from "../components/NFTCard/NFTCard";

// export default function Marketplace() {
//   const [items, setItems] = useState([]);  // Set initial state to an empty array
//   const [loading, setLoading] = useState(true); // Loading state for better UX
//   const { isConnected, signer } = useContext(WalletContext);

//   async function getNFTitems() {
//     const itemsArray = [];
//     if (!signer) return itemsArray; // Return early if no signer is available

//     let contract = new ethers.Contract(
//       MarketplaceJson.address,
//       MarketplaceJson.abi,
//       signer
//     );

//     try {
//       let transaction = await contract.getAllListedNFTs();

//       if (!transaction || transaction.length === 0) {
//         console.log("No NFTs listed");
//         return itemsArray; // Return empty array if no NFTs are listed
//       }

//       for (const i of transaction) {
//         const tokenId = parseInt(i.tokenId);
//         const tokenURI = await contract.tokenURI(tokenId);

//         // Try-catch block for error handling during tokenURI fetching
//         try {
//           const meta = (await axios.get(tokenURI)).data;
//           const price = ethers.formatEther(i.price);

//           const item = {
//             price,
//             tokenId,
//             seller: i.seller,
//             owner: i.owner,
//             image: meta.image,
//             name: meta.name,
//             description: meta.description,
//           };

//           itemsArray.push(item);
//         } catch (err) {
//           console.error(`Error fetching metadata for token ID ${tokenId}:`, err);
//         }
//       }

//       return itemsArray;
//     } catch (error) {
//       console.error("Error fetching NFTs from the contract:", error);
//       return itemsArray; // Return empty array in case of error
//     }
//   }

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true); // Set loading to true while fetching data

//       if (signer && isConnected) {
//         try {
//           const itemsArray = await getNFTitems();
//           setItems(itemsArray);
//         } catch (error) {
//           console.error("Error fetching NFT items:", error);
//         }
//       }

//       setLoading(false); // Set loading to false once data is fetched
//     };

//     fetchData();
//   }, [isConnected, signer]); // Add signer as a dependency

//   return (
//     <div className={styles.container}>
//       <Header />
//       <div className={styles.innerContainer}>
//         <div className={styles.content}>
//           {isConnected ? (
//             <>
//               <div className={styles.nftSection}>
//                 <h2 className={styles.heading}>NFT Marketplace</h2>

//                 {loading ? (
//                   <div>Loading NFTs...</div> // Show loading state while fetching data
//                 ) : items?.length > 0 ? (
//                   <div className={styles.nftGrid}>
//                     {items?.map((value, index) => (
//                       <NFTCard item={value} key={index} />
//                     ))}
//                   </div>
//                 ) : (
//                   <div className={styles.noNFT}>No NFT Listed Now...</div> // Handle no NFT listed case
//                 )}
//               </div>
//             </>
//           ) : (
//             <div className={styles.notConnected}>You are not connected...</div>
//           )}
//         </div>
//       </div>
//       <Footer />
//     </div>
//   );
// }
