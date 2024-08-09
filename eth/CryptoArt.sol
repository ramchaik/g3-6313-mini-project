// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CryptoArt {
    struct Project {
        address proposer;
        address artist;
        string ipfsCid;
        string progressIpfsCid;
        string artIpfsCid;
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
    event ProgressUpdated(
        uint256 projectId,
        string newIpfsCid,
        uint256 completedMilestones
    );
    event MilestoneCompleted(
        uint256 projectId,
        uint256 milestoneNumber,
        uint256 payment
    );
    event ProjectCompleted(uint256 projectId);

    // Function to create a new project and store the IPFS CID
    function createProject(
        string memory _ipfsCid,
        uint256 _totalMilestones,
        uint256 _totalPayment
    ) public payable {
        require(
            msg.value == _totalPayment,
            "Payment must match total project cost"
        );
        projectCount++;
        projects[projectCount] = Project({
            proposer: msg.sender,
            artist: address(0),
            ipfsCid: _ipfsCid,
            totalMilestones: _totalMilestones,
            completedMilestones: 0,
            totalPayment: _totalPayment,
            releasedPayment: 0,
            isCompleted: false,
            progressIpfsCid: "",
            artIpfsCid: ""
        });
        emit ProjectCreated(projectCount, msg.sender, _ipfsCid);
    }

    // Function to read the details of a project by ID
    function readProject(
        uint256 _projectId
    ) public view returns (Project memory) {
        return projects[_projectId];
    }

    // Function to update the IPFS CID of a project
    function updateProject(
        uint256 _projectId,
        string memory _newIpfsCid
    ) public {
        Project storage project = projects[_projectId];
        require(
            msg.sender == project.artist,
            "Only artist can update progress"
        );
        project.progressIpfsCid = _newIpfsCid;
        project.completedMilestones++;
        emit ProgressUpdated(
            _projectId,
            _newIpfsCid,
            project.completedMilestones
        );
    }

    // Function to delete a project
    function deleteProject(uint256 _projectId) public {
        require(
            msg.sender == projects[_projectId].proposer,
            "Only proposer can delete project"
        );
        require(
            !projects[_projectId].isCompleted,
            "Cannot delete completed project"
        );
        delete projects[_projectId];
    }

    // Function for the artist to accept the project contract
    function acceptProjectContract(uint256 _projectId) public {
        require(
            projects[_projectId].artist == address(0),
            "Project already accepted"
        );
        projects[_projectId].artist = msg.sender;
        emit ProjectAccepted(_projectId, msg.sender);
    }

    function approveProgress(
        uint256 _projectId,
        string memory _newIpfsCid
    ) public {
        Project storage project = projects[_projectId];
        require(
            msg.sender == project.proposer,
            "Only proposer can approve project"
        );

        // Signed progress document by the proposer
        project.artIpfsCid = _newIpfsCid;
        payable(project.artist).transfer(project.totalPayment);
        project.isCompleted = true;
        emit ProjectCompleted(_projectId);
    }

    // Function to get the total number of projects
    function getProjectCount() public view returns (uint256) {
        return projectCount;
    }

    /**
     * @dev Verify encrypted data
     * @param _message Hash of the message (h = web3.utils.soliditySha3(document))
     * @param _v Recovery id (v = "0x" + signature.slice(130, 132); web3.utils.toDecimal(v); v + 27;)
     * @param _r First 32 bytes of the signature (r = signature.slice(0, 66);)
     * @param _s Second 32 bytes of the signature (s = "0x" + signature.slice(66, 130);)
     */
    function verify(
        bytes32 _message,
        uint8 _v,
        bytes32 _r,
        bytes32 _s
    ) public pure returns (address) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 prefixedHash = keccak256(abi.encodePacked(prefix, _message));
        address signer = ecrecover(prefixedHash, _v, _r, _s);
        return signer;
    }

    // Function to verify the document signature by comparing the recovered address to the artist's address
    function verifyArtistSignature(
        uint256 _projectId,
        bytes32 _message,
        uint8 _v,
        bytes32 _r,
        bytes32 _s
    ) public view returns (bool) {
        Project memory project = projects[_projectId];
        address recoveredAddress = verify(_message, _v, _r, _s);
        return (recoveredAddress == project.artist);
    }

       function verifyProposerSignature(
        uint256 _projectId,
        bytes32 _message,
        uint8 _v,
        bytes32 _r,
        bytes32 _s
    ) public view returns (bool) {
        Project memory project = projects[_projectId];
        address recoveredAddress = verify(_message, _v, _r, _s);
        return (recoveredAddress == project.proposer);
    }
}
