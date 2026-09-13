// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

interface IERC20 {
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
}

contract AgenticPayments {
    address public owner;
    IERC20 public paymentToken;

    struct Agent {
        bool authorized;
        uint256 spendingLimit;
        uint256 spent;
    }

    mapping(address => Agent) public agents;

    event AgentRegistered(
        address indexed agent,
        uint256 spendingLimit
    );

    event AgentRevoked(
        address indexed agent
    );

    event PaymentMade(
        address indexed agent,
        address indexed merchant,
        uint256 amount
    );

    constructor(address _paymentToken) {
        owner = msg.sender;
        paymentToken = IERC20(_paymentToken);
    }

    function registerAgent(
        address agent,
        uint256 spendingLimit
    ) public {
        require(
            msg.sender == owner,
            "Only owner can register agent"
        );

        require(
            agent != address(0),
            "Invalid agent address"
        );

        require(
            spendingLimit > 0,
            "Limit must be greater than zero"
        );

        agents[agent] = Agent({
            authorized: true,
            spendingLimit: spendingLimit,
            spent: 0
        });

        emit AgentRegistered(
            agent,
            spendingLimit
        );
    }

    function revokeAgent(
        address agent
    ) public {
        require(
            msg.sender == owner,
            "Only owner can revoke agent"
        );

        require(
            agents[agent].authorized,
            "Agent is not authorized"
        );

        agents[agent].authorized = false;

        emit AgentRevoked(agent);
    }

    function makePayment(
        address merchant,
        uint256 amount
    ) public {
        Agent storage agent = agents[msg.sender];

        require(
            agent.authorized,
            "Agent is not authorized"
        );

        require(
            merchant != address(0),
            "Invalid merchant address"
        );

        require(
            amount > 0,
            "Amount must be greater than zero"
        );

        require(
            agent.spent + amount <= agent.spendingLimit,
            "Spending limit exceeded"
        );

        agent.spent += amount;

        require(
            paymentToken.transferFrom(
                msg.sender,
                merchant,
                amount
            ),
            "Token transfer failed"
        );

        emit PaymentMade(
            msg.sender,
            merchant,
            amount
        );
    }
}