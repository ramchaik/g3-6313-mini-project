// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CryptoArt {
    struct Project {
        address proposer;
        address artist;
        string ipfsCid;
        uint256 totalMilestones;
        uint256 completedMilestones;
        uint256 totalPayment;
        uint256 releasedPayment;
        bool isCompleted;
    }

    mapping(uint256 => Project) public projects;
    uint256 public projectCount;

    // Events
    event ProjectCreated(uint256 projectId, address proposer, string ipfsCid);
    event ProjectAccepted(uint256 projectId, address artist);
    event ProgressUpdated(uint256 projectId, string newIpfsCid);
    event MilestoneCompleted(uint256 projectId, uint256 milestoneNumber, uint256 payment);
    event ProjectCompleted(uint256 projectId);

    // Function to create a new project and store the IPFS CID
    function createProject(string memory _ipfsCid, uint256 _totalMilestones, uint256 _totalPayment) public payable {
        require(msg.value == _totalPayment, "Payment must match total project cost");
        projectCount++;
        projects[projectCount] = Project({
            proposer: msg.sender,
            artist: address(0),
            ipfsCid: _ipfsCid,
            totalMilestones: _totalMilestones,
            completedMilestones: 0,
            totalPayment: _totalPayment,
            releasedPayment: 0,
            isCompleted: false
        });
        emit ProjectCreated(projectCount, msg.sender, _ipfsCid);
    }

    // Function to read the details of a project by ID
    function readProject(uint256 _projectId) public view returns (Project memory) {
        return projects[_projectId];
    }

    // Function to update the IPFS CID of a project
    function updateProject(uint256 _projectId, string memory _newIpfsCid) public {
        require(msg.sender == projects[_projectId].proposer, "Only proposer can update project");
        projects[_projectId].ipfsCid = _newIpfsCid;
        emit ProgressUpdated(_projectId, _newIpfsCid);
    }

    // Function to delete a project
    function deleteProject(uint256 _projectId) public {
        require(msg.sender == projects[_projectId].proposer, "Only proposer can delete project");
        require(!projects[_projectId].isCompleted, "Cannot delete completed project");
        delete projects[_projectId];
    }

    // Function for the artist to accept the project contract
    function acceptProjectContract(uint256 _projectId) public {
        require(projects[_projectId].artist == address(0), "Project already accepted");
        projects[_projectId].artist = msg.sender;
        emit ProjectAccepted(_projectId, msg.sender);
    }

    // Function for the artist to update the progress of the project
    function updateProgress(uint256 _projectId, string memory _newIpfsCid) public {
        require(msg.sender == projects[_projectId].artist, "Only artist can update progress");
        projects[_projectId].ipfsCid = _newIpfsCid;
        emit ProgressUpdated(_projectId, _newIpfsCid);
    }

    // Function to complete a milestone and release payment
    function milestoneComplete(uint256 _projectId) public {
        Project storage project = projects[_projectId];
        require(msg.sender == project.proposer, "Only proposer can complete milestone");
        require(project.completedMilestones < project.totalMilestones, "All milestones already completed");
        
        project.completedMilestones++;
        uint256 payment = project.totalPayment / project.totalMilestones;
        project.releasedPayment += payment;
        
        payable(project.artist).transfer(payment);
        emit MilestoneCompleted(_projectId, project.completedMilestones, payment);
        
        if (project.completedMilestones == project.totalMilestones) {
            project.isCompleted = true;
            emit ProjectCompleted(_projectId);
        }
    }

    // Function to validate the progress of the project
    function validateProgress(uint256 _projectId) public view returns (bool) {
        Project memory project = projects[_projectId];
        return (project.completedMilestones > 0 && !project.isCompleted);
    }

    // Function to get the total number of projects
    function getProjectCount() public view returns (uint256) {
        return projectCount;
    }

    // Function to recover the signer's address from the signature
    function recoverSigner(bytes32 messageHash, uint8 v, bytes32 r, bytes32 s) public pure returns (address) {
        return ecrecover(messageHash, v, r, s);
    }

    // Function to verify the document signature by comparing the recovered address to the artist's address
    function verifySignature(uint256 _projectId, bytes32 messageHash, uint8 v, bytes32 r, bytes32 s) public view returns (bool) {
        Project memory project = projects[_projectId];
        address recoveredAddress = ecrecover(messageHash, v, r, s);
        return (recoveredAddress == project.artist);
    }
}
