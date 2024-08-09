import React, { useState } from 'react';
import { Box, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, FormControl, FormLabel, Input, useDisclosure, useToast } from '@chakra-ui/react';
import { create } from 'ipfs-http-client';
import { Buffer } from 'buffer';
import { useWeb3 } from '../context/Web3Context';

const ipfs = create('http://127.0.0.1:5001');

const environment = process.env.REACT_APP_ENVIRONMENT; // Fetch the environment from .env

const UpdateMilestoneDialog = ({ projectId, onSubmit }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { web3 } = useWeb3();
  const [file, setFile] = useState(null);
  const toast = useToast();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      if (environment === 'eth') {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onloadend = async (event) => {
          const fileContent = event.target.result;
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });;
          const defaultAcc = accounts[0];

          const hash = web3.utils.soliditySha3(fileContent);

          const signature = await web3.eth.sign(hash, defaultAcc); // using ECDSA

          const combinedBlob = new Blob([fileContent, new TextEncoder().encode(signature)]);

          const { cid } = await ipfs.add(combinedBlob);

          onSubmit(projectId, cid.toString());
          toast({
            title: "File uploaded and signed.",
            description: `CID: ${cid}`,
            status: "success",
            duration: 5000,
            isClosable: true,
          });
          onClose();
        };
      } else if (environment === 'hlf') {
        console.log("HLF: Simulating file upload and signing.");
        // Simulate IPFS CID for HLF environment
        const simulatedCid = 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDdcc9v9ieT1d';
        onSubmit(projectId, simulatedCid);
        toast({
          title: "HLF: File uploaded and signed (simulated).",
          description: `CID: ${simulatedCid}`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        onClose();
      }
    } catch (error) {
      console.error('Error uploading file: ', error);
      toast({
        title: "Error",
        description: "There was an error uploading and signing your file.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <>
      <Button size="xs" colorScheme="blue" onClick={onOpen}>Update Milestone</Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload Progress Document</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Upload Document</FormLabel>
              <Input type="file" onChange={handleFileChange} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleUpload}>
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateMilestoneDialog;
