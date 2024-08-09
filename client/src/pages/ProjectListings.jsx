import React, { useEffect, useState } from 'react';
import { Box, Text, Table, Thead, Tbody, Tr, Th, Td, Button, ButtonGroup, useToast, Tooltip } from '@chakra-ui/react';
import { useWeb3 } from '../context/Web3Context';
import { create } from 'ipfs-http-client';
import { Buffer } from 'buffer';
import UpdateMilestoneDialog from '../components/UpdateMilestoneDialog';
const ipfs = create('http://localhost:5001');
const environment = process.env.REACT_APP_ENVIRONMENT; // Fetch the environment from .env

const ProjectListings = () => {
  const { web3, contract } = useWeb3();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState(null);
  const [view, setView] = useState('available'); // Default to 'available'
  const toast = useToast();

  useEffect(() => {
    const fetchAccount = async () => {
      if (web3) {
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);
      }
    };

    const fetchProjects = async () => {
      if (contract && environment === 'eth') {
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
      } else if (environment === 'hlf') {
        console.log("HLF: Simulating fetching projects.");
        setProjects([
          { id: 1, proposer: '0xProposer', artist: '0xArtist', ipfsCid: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDdcc9v9ieT1d', progressIpfsCid: 'QmYoypizjW3WknFiJnKLwHCnL72vedxjQkDdcc9v9ieT1e', artIpfsCid: 'QmZoypizjW3WknFiJnKLwHCnL72vedxjQkDdcc9v9ieT1f', totalMilestones: 5, completedMilestones: 3, isCompleted: false },
        ]);
        setLoading(false);
      }
    };

    if (web3 && contract) {
      fetchAccount();
      fetchProjects();
    }
  }, [contract, web3]);

  const downloadFromIPFS = async (cid, filename) => {
    if (environment === 'eth') {
      try {
        const chunks = [];
        for await (const chunk of ipfs.cat(cid)) {
          chunks.push(chunk);
        }
        const blob = new Blob(chunks, { type: 'application/pdf' }); // Assuming the file is a PDF
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'downloaded_file.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading from IPFS:', error);
        toast({
          title: "Download Error",
          description: "There was an error downloading the file from IPFS.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } else if (environment === 'hlf') {
      console.log(`HLF: Simulating download of file with CID ${cid} and filename ${filename}`);
      // Simulate download logic for Hyperledger Fabric environment
    }
  };



  const handleVerify = async (project, cid, type) => {
    if (environment === 'eth') {
      try {
        // Fetch the signed PDF from IPFS
        const chunks = [];
        for await (const chunk of ipfs.cat(cid)) {
          chunks.push(chunk);
        }
        const signedFile = new Uint8Array(Buffer.concat(chunks));

        // Extract the original file content and the signature
        const fileContent = signedFile.slice(0, signedFile.length - 132); // PDF content
        const signatureHex = Buffer.from(signedFile.slice(signedFile.length - 132)).toString('hex'); // Extract signature as hex string

        // Extract r, s, v from the signature
        const r = "0x" + signatureHex.slice(0, 64); // First 64 characters (32 bytes)
        const s = "0x" + signatureHex.slice(64, 128); // Next 64 characters (32 bytes)
        let v = "0x" + signatureHex.slice(128, 130); // Final 2 characters (1 byte)

        // Web3 expects v as a number, so convert it correctly
        v = web3.utils.hexToNumber(v);
        if (v < 27) {
          v += 27; // Adjusting v to be in the correct range (27 or 28)
        }

        // Recreate the message hash from the file content
        const messageHash = web3.utils.soliditySha3({ t: 'bytes', v: fileContent });

        console.log("Project ID:", project.id);
        console.log("Message Hash:", messageHash);
        console.log("v:", v);
        console.log("r:", r);
        console.log("s:", s);
        let isValid;
        // Call the verifySignature function in the contract
        if (type === 'proposer') {
          isValid = await contract.methods.verifyProposerSignature(project.id, messageHash, v, r, s).call();
        }
        else {
          isValid = await contract.methods.verifyArtistSignature(project.id, messageHash, v, r, s).call();

        }
        if (isValid) {
          toast({
            title: "Verification successful.",
            description: "The document is verified and signed by the author.",
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
    } else if (environment === 'hlf') {
      console.log(`HLF: Simulating verification for project ${project.id}`);
    }
  };



  const handleUpdateProgress = async (projectId, newIpfsCid) => {
    console.log(projectId, newIpfsCid)
    try {
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];

      // Call the smart contract method to update the project progress
      const receipt = await contract.methods.updateProject(projectId, newIpfsCid).send({ from: account });

      // Extract the completedMilestones value from the emitted event
      const completedMilestones = receipt.events.ProgressUpdated.returnValues.completedMilestones;

      // Provide feedback to the user
      toast({
        title: "Progress updated.",
        description: "The project progress has been successfully updated.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Update the project progress in local data
      setProjects((prevProjects) =>
        prevProjects.map((project) => {
          if (project.id === projectId) {
            return {
              ...project,
              progressIpfsCid: newIpfsCid,
              completedMilestones, // Directly set the completedMilestones from the event
            };
          }
          return project;
        })
      );
    } catch (error) {
      console.error("Error updating progress:", error);
      toast({
        title: "Error",
        description: "There was an error updating the project progress.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };


  const handleCompleteProject = async (projectId, ipfsCid) => {
    if (environment === 'eth') {
      try {
        await contract.methods.approveProgress(projectId, ipfsCid).send({ from: account });
        toast({
          title: "Project Completed",
          description: "The project has been successfully completed.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        // Update the project status to completed in local state
        setProjects((prevProjects) =>
          prevProjects.map((project) =>
            project.id === projectId ? { ...project, isCompleted: true } : project
          )
        );
      } catch (error) {
        console.error("Error completing project:", error);
        toast({
          title: "Error",
          description: "There was an error completing the project.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } else if (environment === 'hlf') {
      console.log(`HLF: Simulating completion of project ${projectId}`);
      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project.id === projectId ? { ...project, isCompleted: true } : project
        )
      );
    }
  };

  const handleAccept = async (projectId) => {
    try {
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];

      // Call the smart contract method to accept the project
      await contract.methods.acceptProjectContract(projectId).send({ from: account });

      // Provide feedback to the user
      toast({
        title: "Project accepted.",
        description: "You have successfully accepted the project.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Optionally, update the project status in local data (e.g., move it to the "In Progress" section)
      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project.id === projectId ? { ...project, artist: account } : project
        )
      );
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


  const filteredProjects = projects.filter((project) => {
    if (view === 'available') {
      return !project.isCompleted && project.artist === '0x0000000000000000000000000000000000000000';
    }
    if (view === 'inProgress') {
      return !project.isCompleted && project.artist !== '0x0000000000000000000000000000000000000000' &&
        (project.proposer === account || project.artist === account);
    }
    if (view === 'completed') {
      return project.isCompleted;
    }
    return false;
  });

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (projects.length === 0) {
    return <Text>No projects found.</Text>;
  }

  return (
    <Box p={6} w={["100%", "100%", "100%", "100%"]}>
      <ButtonGroup variant="outline" spacing="6" mb="6">
        <Button
          colorScheme={view === 'available' ? 'blue' : 'gray'}
          onClick={() => setView('available')}
        >
          Available Projects
        </Button>
        <Button
          colorScheme={view === 'inProgress' ? 'blue' : 'gray'}
          onClick={() => setView('inProgress')}
        >
          In Progress
        </Button>
        <Button
          colorScheme={view === 'completed' ? 'blue' : 'gray'}
          onClick={() => setView('completed')}
        >
          Completed
        </Button>
      </ButtonGroup>
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th>Project ID</Th>
            <Th width="20%">Proposer</Th>
            <Th width="20%">Artist</Th>
            <Th>IPFS File</Th>
            {view === 'inProgress' && <Th>Progress IPFS File</Th>}
            {view === 'completed' && <Th>Art IPFS File</Th>}
            <Th>Total Milestones</Th>
            <Th>Completed Milestones</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredProjects.map((project) => (
            <Tr key={project.id}>
              <Td>{project.id}</Td>
              <Td>
                <Tooltip label={project.proposer} fontSize="md">
                  <Text isTruncated maxW="150px">
                    {project.proposer}
                  </Text>
                </Tooltip>
              </Td>
              <Td>
                <Tooltip label={project.artist} fontSize="md">
                  <Text isTruncated maxW="150px">
                    {project.artist}
                  </Text>
                </Tooltip>
              </Td>
              <Td>
                <Button
                  colorScheme="blue"
                  size="xs"
                  onClick={() => downloadFromIPFS(project.ipfsCid, `project_${project.id}_initial.pdf`)}
                >
                  Download
                </Button>
              </Td>
              {view === 'inProgress' && (
                <Td>
                  <Button
                    colorScheme="blue"
                    size="xs"
                    onClick={() => downloadFromIPFS(project.progressIpfsCid, `project_${project.id}_progress.pdf`)}
                  >
                    Download Progress
                  </Button>
                </Td>
              )}
              {view === 'completed' && (
                <Td>
                  <Button
                    colorScheme="blue"
                    size="xs"
                    onClick={() => downloadFromIPFS(project.artIpfsCid, `project_${project.id}_art.pdf`)}
                  >
                    Download Art
                  </Button>
                </Td>
              )}
              <Td>{project.totalMilestones.toString()}</Td>
              <Td>{project.completedMilestones.toString()}</Td>
              <Td>
                {view === 'available' && (
                  <>
                    <Button
                      colorScheme="blue"
                      size="xs"
                      onClick={() => handleVerify(project, project.ipfsCid, 'proposer')}
                      className='mr-1'
                    >
                      Verify Proposal Document
                    </Button>
                    {account !== project.proposer && (
                      <Button colorScheme="teal" size="xs" onClick={() => handleAccept(project.id)}>
                        Accept Proposal
                      </Button>
                    )}
                  </>
                )}
                {view === 'inProgress' && (
                  <>
                    {account === project.artist && (
                      project.totalMilestones === project.completedMilestones ? <Text>Under Review</Text> :
                        <UpdateMilestoneDialog projectId={project.id} onSubmit={handleUpdateProgress} />
                    )}
                    {account === project.proposer && (
                      <>
                        <Button
                          colorScheme="teal"
                          size="xs"
                          onClick={() => handleVerify(project, project.progressIpfsCid, 'artist')}
                          className='mr-1'
                        >
                          Verify Progress Document
                        </Button>
                        {project.completedMilestones === project.totalMilestones && (
                          <Button
                            colorScheme="blue"
                            size="xs"
                            onClick={() => handleCompleteProject(project.id, project.progressIpfsCid)}
                          >
                            Complete Project
                          </Button>
                        )}
                      </>
                    )}
                  </>
                )}
                {view === 'completed' && (
                  <Button
                    colorScheme="teal"
                    size="xs"
                    onClick={() => handleVerify(project, project.artIpfsCid, 'artist')}
                  >
                    Verify Artist Signature
                  </Button>
                )}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

    </Box>
  );
};

export default ProjectListings;
