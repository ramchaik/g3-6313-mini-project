// src/components/ProjectListings.js
import React, { useEffect, useState } from 'react';
import { Box, Text, Card, CardHeader, CardBody, CardFooter, Heading } from '@chakra-ui/react';
import { useWeb3 } from '../context/Web3Context';

const ProjectListings = () => {
  const { web3, contract } = useWeb3();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      if (contract) {
        try {
          const projectCount = await contract.methods.getProjectCount().call();
          const projectArray = [];
          for (let i = 1; i <= projectCount; i++) {
            const project = await contract.methods.readProject(i).call();
            projectArray.push({ ...project, id: i });
          }
          setProjects(projectArray);
        } catch (error) {
          console.error("Error fetching projects:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProjects();
  }, [contract]);

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
              {/* Additional actions can go here */}
            </CardFooter>
          </Card>
        ))}
      </div>
    </Box>
  );
};

export default ProjectListings;
