import React, { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, NumberInput, NumberInputField, useToast } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { create } from 'ipfs-http-client';
import { useWeb3 } from '../context/Web3Context';

const ipfs = create({ url: 'http://127.0.0.1:5001' }); // Using local IPFS node

const CreateProject = () => {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();
  const [formData, setFormData] = useState({});
  const toast = useToast();
  const { web3, contract } = useWeb3(); // Accessing web3 and contract from the context

  const onFileChange = async (e) => {
    const file = e.target.files[0];
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const document = reader.result;

        // Generate hash of the document
        const messageHash = web3.utils.soliditySha3(document);

        // Sign the hash
        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];
        const signature = await web3.eth.sign(messageHash, account);

        // Define the MFS path
        const MFS_path = `/files_${messageHash.replace("0x", "")}`;

        // Store the signed document in IPFS at the specified MFS path
        await ipfs.files.write(MFS_path, new TextEncoder().encode(signature), { create: true, parents: true });

        // Retrieve the CID for the MFS path
        const stat = await ipfs.files.stat(MFS_path);
        const ipfsCid = stat.cid.toString();

        setValue('ipfsCid', ipfsCid);

        toast({
          title: "File signed and uploaded to IPFS.",
          description: `CID: ${ipfsCid}`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      };
      reader.readAsText(file);
    } catch (error) {
      if (error.message.includes("User rejected the request")) {
        toast({
          title: "Transaction Rejected",
          description: "You rejected the transaction request.",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      } else {
        console.error(error);
        toast({
          title: "Error",
          description: "There was an error creating your project.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } 
  };

  const onSubmit = async (data) => {
    setFormData(data);

    try {
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];
      const { ipfsCid, totalMilestones, totalPayment } = data;

      // Call smart contract method to store the IPFS CID and project details
      const receipt = await contract.methods.createProject(ipfsCid, totalMilestones, web3.utils.toWei(totalPayment.toString(), 'ether'))
        .send({ from: account, value: web3.utils.toWei(totalPayment.toString(), 'ether') });

      toast({
        title: "Project created.",
        description: "Your project has been created successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      console.log("Transaction receipt: ", receipt);
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
