import React, { useEffect, useState } from 'react';
import { Box, Text, Card, CardHeader, CardBody, CardFooter, Heading, Button, useToast } from '@chakra-ui/react';
import { useWeb3 } from '../context/Web3Context';
import { create } from 'ipfs-http-client';
import { Buffer } from 'buffer';
// Initialize the IPFS client
const ipfs = create({ url: 'http://127.0.0.1:5001' });

const ProjectListings = () => {
  const { web3, contract } = useWeb3();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const fetchAccount = async () => {
      if (web3) {
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);
      }
    };

    const fetchProjects = async () => {
      if (contract) {
        try {
          const projectCount = await contract.methods.getProjectCount().call();
          const projectArray = [];
          for (let i = 1; i <= projectCount; i++) {
            try {
              const project = await contract.methods.readProject(i).call();
              projectArray.push({ ...project, id: i });
            } catch (error) {
              console.error(`Error fetching project ${i}:`, error);
            }
          }
          setProjects(projectArray);
        } catch (error) {
          console.error("Error fetching projects:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (web3 && contract) {
      fetchAccount();
      fetchProjects();
    }
  }, [contract, web3]);

  const handleVerify = async (project) => {
    try {
      const ipfsCid = project.ipfsCid;

      // Fetch the signature from IPFS
      const resp = await ipfs.cat(ipfsCid);
      let content = [];
      let raw = "";

      for await (const chunk of resp) {
        content = [...content, ...chunk];
        raw = Buffer.from(content).toString('utf8');
      }

      // Extract r, s, v from the signature
      const r = raw.slice(0, 66); // First 66 characters including '0x'
      const s = "0x" + raw.slice(66, 130); // Next 64 characters
      let v = "0x" + raw.slice(130, 132); // Final 2 characters
      v = web3.utils.toDecimal(v) + 27; // Convert v to a decimal and adjust

      // Recreate the message hash
      const messageHash = web3.utils.soliditySha3(project.ipfsCid);

      // Call the verifySignature function in the contract
      const isValid = await contract.methods.verifySignature(project.id, messageHash, v, r, s).call();

      if (isValid) {
        toast({
          title: "Verification successful.",
          description: "The document is verified with the artist's ID.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Verification failed.",
          description: "The document does not match the artist's signature.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error verifying document:", error);
      toast({
        title: "Error",
        description: "There was an error verifying the document.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleAccept = async (projectId) => {
    try {
      await contract.methods.acceptProjectContract(projectId).send({ from: account });
      toast({
        title: "Project accepted.",
        description: "You have successfully accepted the project.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      // Optionally refresh the projects list
    } catch (error) {
      console.error("Error accepting project:", error);
      toast({
        title: "Error",
        description: "There was an error accepting the project.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (projects.length === 0) {
    return <Text>No projects found.</Text>;
  }

  return (
    <Box p={6} w={["100%", "100%", "100%", "100%"]}>
      <div className='flex flex-col items-center justify-center'>
        {projects.map((project) => (
          <Card key={project.id} borderWidth="1px" borderRadius="lg" overflow="hidden">
            <CardHeader>
              <Heading size="md">Project ID: {project.id}</Heading>
            </CardHeader>
            <CardBody>
              <Text><strong>Proposer:</strong> {project.proposer}</Text>
              <Text><strong>Artist:</strong> {project.artist}</Text>
              <Text><strong>IPFS Hash:</strong> {project.ipfsHash}</Text>
              <Text><strong>Total Milestones:</strong> {project.totalMilestones}</Text>
              <Text><strong>Completed Milestones:</strong> {project.completedMilestones}</Text>
              <Text><strong>Total Payment:</strong> {web3.utils.fromWei(project.totalPayment, 'ether')} ETH</Text>
              <Text><strong>Released Payment:</strong> {web3.utils.fromWei(project.releasedPayment, 'ether')} ETH</Text>
              <Text><strong>Is Completed:</strong> {project.isCompleted ? 'Yes' : 'No'}</Text>
            </CardBody>
            <CardFooter>
              {/* Buttons visible only if the current account is not the proposer */}
              {account !== project.proposer && (
                <>
                  <Button colorScheme="teal" mr={3} onClick={() => handleVerify(project)}>
                    Verify
                  </Button>
                  <Button colorScheme="blue" onClick={() => handleAccept(project.id)}>
                    Accept
                  </Button>
                </>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </Box>
  );
};

export default ProjectListings;
