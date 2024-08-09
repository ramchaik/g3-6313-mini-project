// src/context/Web3Context.js
import React, {
	createContext,
	useContext,
	useEffect,
	useState
} from 'react';
import Web3 from 'web3';

const Web3Context = createContext();

export const Web3Provider = ({
	children
}) => {
	const [web3, setWeb3] = useState(null);
	const [contract, setContract] = useState(null);

	const contractAddress = '0x0590d6e82c3Cb5BC1B1748773E60AFf57B1C59D2';
	const contractABI = [
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "_projectId",
					"type": "uint256"
				}
			],
			"name": "acceptProjectContract",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "_projectId",
					"type": "uint256"
				},
				{
					"internalType": "string",
					"name": "_newIpfsCid",
					"type": "string"
				}
			],
			"name": "approveProgress",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "string",
					"name": "_ipfsCid",
					"type": "string"
				},
				{
					"internalType": "uint256",
					"name": "_totalMilestones",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "_totalPayment",
					"type": "uint256"
				}
			],
			"name": "createProject",
			"outputs": [],
			"stateMutability": "payable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "_projectId",
					"type": "uint256"
				}
			],
			"name": "deleteProject",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "projectId",
					"type": "uint256"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "milestoneNumber",
					"type": "uint256"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "payment",
					"type": "uint256"
				}
			],
			"name": "MilestoneCompleted",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "projectId",
					"type": "uint256"
				},
				{
					"indexed": false,
					"internalType": "string",
					"name": "newIpfsCid",
					"type": "string"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "completedMilestones",
					"type": "uint256"
				}
			],
			"name": "ProgressUpdated",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "projectId",
					"type": "uint256"
				},
				{
					"indexed": false,
					"internalType": "address",
					"name": "artist",
					"type": "address"
				}
			],
			"name": "ProjectAccepted",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "projectId",
					"type": "uint256"
				}
			],
			"name": "ProjectCompleted",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "projectId",
					"type": "uint256"
				},
				{
					"indexed": false,
					"internalType": "address",
					"name": "proposer",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "string",
					"name": "ipfsCid",
					"type": "string"
				}
			],
			"name": "ProjectCreated",
			"type": "event"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "_projectId",
					"type": "uint256"
				},
				{
					"internalType": "string",
					"name": "_newIpfsCid",
					"type": "string"
				}
			],
			"name": "updateProject",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "getProjectCount",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "projectCount",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"name": "projects",
			"outputs": [
				{
					"internalType": "address",
					"name": "proposer",
					"type": "address"
				},
				{
					"internalType": "address",
					"name": "artist",
					"type": "address"
				},
				{
					"internalType": "string",
					"name": "ipfsCid",
					"type": "string"
				},
				{
					"internalType": "string",
					"name": "progressIpfsCid",
					"type": "string"
				},
				{
					"internalType": "string",
					"name": "artIpfsCid",
					"type": "string"
				},
				{
					"internalType": "uint256",
					"name": "totalMilestones",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "completedMilestones",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "totalPayment",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "releasedPayment",
					"type": "uint256"
				},
				{
					"internalType": "bool",
					"name": "isCompleted",
					"type": "bool"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "_projectId",
					"type": "uint256"
				}
			],
			"name": "readProject",
			"outputs": [
				{
					"components": [
						{
							"internalType": "address",
							"name": "proposer",
							"type": "address"
						},
						{
							"internalType": "address",
							"name": "artist",
							"type": "address"
						},
						{
							"internalType": "string",
							"name": "ipfsCid",
							"type": "string"
						},
						{
							"internalType": "string",
							"name": "progressIpfsCid",
							"type": "string"
						},
						{
							"internalType": "string",
							"name": "artIpfsCid",
							"type": "string"
						},
						{
							"internalType": "uint256",
							"name": "totalMilestones",
							"type": "uint256"
						},
						{
							"internalType": "uint256",
							"name": "completedMilestones",
							"type": "uint256"
						},
						{
							"internalType": "uint256",
							"name": "totalPayment",
							"type": "uint256"
						},
						{
							"internalType": "uint256",
							"name": "releasedPayment",
							"type": "uint256"
						},
						{
							"internalType": "bool",
							"name": "isCompleted",
							"type": "bool"
						}
					],
					"internalType": "struct CryptoArt.Project",
					"name": "",
					"type": "tuple"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "bytes32",
					"name": "_message",
					"type": "bytes32"
				},
				{
					"internalType": "uint8",
					"name": "_v",
					"type": "uint8"
				},
				{
					"internalType": "bytes32",
					"name": "_r",
					"type": "bytes32"
				},
				{
					"internalType": "bytes32",
					"name": "_s",
					"type": "bytes32"
				}
			],
			"name": "verify",
			"outputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"stateMutability": "pure",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "_projectId",
					"type": "uint256"
				},
				{
					"internalType": "bytes32",
					"name": "_message",
					"type": "bytes32"
				},
				{
					"internalType": "uint8",
					"name": "_v",
					"type": "uint8"
				},
				{
					"internalType": "bytes32",
					"name": "_r",
					"type": "bytes32"
				},
				{
					"internalType": "bytes32",
					"name": "_s",
					"type": "bytes32"
				}
			],
			"name": "verifyArtistSignature",
			"outputs": [
				{
					"internalType": "bool",
					"name": "",
					"type": "bool"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "_projectId",
					"type": "uint256"
				},
				{
					"internalType": "bytes32",
					"name": "_message",
					"type": "bytes32"
				},
				{
					"internalType": "uint8",
					"name": "_v",
					"type": "uint8"
				},
				{
					"internalType": "bytes32",
					"name": "_r",
					"type": "bytes32"
				},
				{
					"internalType": "bytes32",
					"name": "_s",
					"type": "bytes32"
				}
			],
			"name": "verifyProposerSignature",
			"outputs": [
				{
					"internalType": "bool",
					"name": "",
					"type": "bool"
				}
			],
			"stateMutability": "view",
			"type": "function"
		}
	]

	useEffect(() => {
		const initWeb3 = async () => {
			if (window.ethereum) {
				const web3Instance = new Web3(window.ethereum);
				try {
					// Request account access if needed
					await window.ethereum.request({
						method: 'eth_requestAccounts'
					});
					setWeb3(web3Instance);

					const contractInstance = new web3Instance.eth.Contract(contractABI, contractAddress);
					setContract(contractInstance);

					// Listen for account changes
					window.ethereum.on('accountsChanged', () => {
						window.location.reload();
					});

					// Listen for network changes
					window.ethereum.on('chainChanged', () => {
						window.location.reload();
					});

				} catch (error) {
					console.error('Error accessing accounts:', error);
				}
			} else {
				console.log('MetaMask is not installed. Please consider installing it: https://metamask.io/download.html');
			}
		};

		initWeb3();
	}, []);

	return ( 
		<Web3Context.Provider value = {{web3,contract}} > 
			{children} 
		</Web3Context.Provider>
	);
};

export const useWeb3 = () => {
	return useContext(Web3Context);
};