import React, { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, NumberInput, NumberInputField, useToast } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { create } from 'ipfs-http-client';
import { useWeb3 } from '../context/Web3Context';

const ipfs = create('http://127.0.0.1:5001'); // Initialize IPFS client

const CreateProject = () => {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();
  const [formData, setFormData] = useState({});
  const toast = useToast();
  const { web3, contract } = useWeb3();

  const onFileChange = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = async (event) => {
      const fileContent = event.target.result;
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        // Convert to checksummed address
        const checksummedAddress = web3.utils.toChecksumAddress(accounts[0]);
        const hash = web3.utils.soliditySha3(fileContent);

        const signature = await web3.eth.sign(hash, checksummedAddress); // using ECDSA

        const combinedBlob = new Blob([fileContent, new TextEncoder().encode(signature)]);

        const { cid } = await ipfs.add(combinedBlob);

        setValue('ipfsCid', cid.toString());

        toast({
          title: "File uploaded to IPFS.",
          description: `CID: ${cid}`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        // Additional logic for updating progress can go here

      } catch (error) {
        console.error('Error uploading file: ', error);
        toast({
          title: "Error",
          description: "There was an error uploading your file to IPFS.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const onSubmit = async (data) => {
    setFormData(data);

    try {
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];
      const { ipfsCid, totalMilestones, totalPayment } = data;

      // Store the CID in the smart contract
      await contract.methods.createProject(ipfsCid, totalMilestones, web3.utils.toWei(totalPayment.toString(), 'ether'))
        .send({ from: account, value: web3.utils.toWei(totalPayment.toString(), 'ether') });

      toast({
        title: "Project created.",
        description: "Your project has been created successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "There was an error creating your project.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box className="p-6 max-w-lg mx-auto bg-white shadow-md rounded-lg mt-10">
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormControl mb={4} isInvalid={errors.ipfsCid}>
          <FormLabel>Upload Document</FormLabel>
          <Input
            type="file"
            onChange={onFileChange}
            className="border-gray-300 rounded-md"
          />
          <Input
            type="hidden"
            {...register('ipfsCid', { required: "IPFS CID is required" })}
          />
          {errors.ipfsCid && <p className="text-red-500 text-xs mt-1">{errors.ipfsCid.message}</p>}
        </FormControl>
        <FormControl mb={4} isInvalid={errors.totalMilestones}>
          <FormLabel>Total Milestones</FormLabel>
          <NumberInput min={1}>
            <NumberInputField
              placeholder="Enter Total Milestones"
              {...register('totalMilestones', { required: "Total Milestones is required", valueAsNumber: true })}
              className="border-gray-300 rounded-md"
            />
          </NumberInput>
          {errors.totalMilestones && <p className="text-red-500 text-xs mt-1">{errors.totalMilestones.message}</p>}
        </FormControl>
        <FormControl mb={4} isInvalid={errors.totalPayment}>
          <FormLabel>Total Payment</FormLabel>
          <NumberInput min={0.1} precision={2} step={0.1}>
            <NumberInputField
              placeholder="Enter Total Payment"
              {...register('totalPayment', { required: "Total Payment is required", valueAsNumber: true })}
              className="border-gray-300 rounded-md"
            />
          </NumberInput>
          {errors.totalPayment && <p className="text-red-500 text-xs mt-1">{errors.totalPayment.message}</p>}
        </FormControl>
        <Button type="submit" colorScheme="teal" size="md" className="w-full">
          Create Project
        </Button>
      </form>
    </Box>
  );
};

export default CreateProject;
