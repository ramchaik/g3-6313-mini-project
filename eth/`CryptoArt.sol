// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CryptoArt {
    struct Project {
        address proposer;
        address artist;
        string ipfsHash;
        uint256 totalMilestones;
        uint256 completedMilestones;
        uint256 totalPayment;
        uint256 releasedPayment;
        bool isCompleted;
    }

    mapping(uint256 => Project) public projects;
    uint256 public projectCount;

    // Events
    event ProjectCreated(uint256 projectId, address proposer, string ipfsHash);
    event ProjectAccepted(uint256 projectId, address artist);
    event ProgressUpdated(uint256 projectId, string newIpfsHash);
    event MilestoneCompleted(uint256 projectId, uint256 milestoneNumber, uint256 payment);
    event ProjectCompleted(uint256 projectId);

    // CRUD operations for documents on IPFS
    function createProject(string memory _ipfsHash, uint256 _totalMilestones, uint256 _totalPayment) public payable {
        require(msg.value == _totalPayment, "Payment must match total project cost");
        projectCount++;
        projects[projectCount] = Project({
            proposer: msg.sender,
            artist: address(0),
            ipfsHash: _ipfsHash,
            totalMilestones: _totalMilestones,
            completedMilestones: 0,
            totalPayment: _totalPayment,
            releasedPayment: 0,
            isCompleted: false
        });
        emit ProjectCreated(projectCount, msg.sender, _ipfsHash);
    }

    function readProject(uint256 _projectId) public view returns (Project memory) {
        return projects[_projectId];
    }

    function updateProject(uint256 _projectId, string memory _newIpfsHash) public {
        require(msg.sender == projects[_projectId].proposer, "Only proposer can update project");
        projects[_projectId].ipfsHash = _newIpfsHash;
        emit ProgressUpdated(_projectId, _newIpfsHash);
    }

    function deleteProject(uint256 _projectId) public {
        require(msg.sender == projects[_projectId].proposer, "Only proposer can delete project");
        require(!projects[_projectId].isCompleted, "Cannot delete completed project");
        delete projects[_projectId];
    }

    // Other functionalities
    function acceptProjectContract(uint256 _projectId) public {
        require(projects[_projectId].artist == address(0), "Project already accepted");
        projects[_projectId].artist = msg.sender;
        emit ProjectAccepted(_projectId, msg.sender);
    }

    function updateProgress(uint256 _projectId, string memory _newIpfsHash) public {
        require(msg.sender == projects[_projectId].artist, "Only artist can update progress");
        projects[_projectId].ipfsHash = _newIpfsHash;
        emit ProgressUpdated(_projectId, _newIpfsHash);
    }

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

    function validateProgress(uint256 _projectId) public view returns (bool) {
        Project memory project = projects[_projectId];
        return (project.completedMilestones > 0 && !project.isCompleted);
    }

    function getProjectCount() public view returns (uint256) {
        return projectCount;
    }
}
