// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AppointmentContract {
    struct Appointment {
        uint256 id;
        address patient;
        address doctor;
        uint256 timestamp;
        uint256 deposit;
        bool confirmed;
        bool completed;
        bool cancelled;
    }

    mapping(uint256 => Appointment) public appointments;
    uint256 public appointmentCount;
    uint256 public constant DEPOSIT_AMOUNT = 0.01 ether; // Adjust as needed

    event AppointmentCreated(uint256 id, address patient, address doctor, uint256 timestamp);
    event AppointmentConfirmed(uint256 id);
    event AppointmentCompleted(uint256 id);
    event AppointmentCancelled(uint256 id);
    event DepositRefunded(uint256 id, address recipient, uint256 amount);

    function createAppointment(address _doctor, uint256 _timestamp) external payable {
        require(msg.value == DEPOSIT_AMOUNT, "Incorrect deposit amount");
        require(_timestamp > block.timestamp, "Appointment must be in the future");
        
        appointmentCount++;
        appointments[appointmentCount] = Appointment({
            id: appointmentCount,
            patient: msg.sender,
            doctor: _doctor,
            timestamp: _timestamp,
            deposit: msg.value,
            confirmed: false,
            completed: false,
            cancelled: false
        });

        emit AppointmentCreated(appointmentCount, msg.sender, _doctor, _timestamp);
    }

    function confirmAppointment(uint256 _id) external {
        Appointment storage appointment = appointments[_id];
        require(appointment.doctor == msg.sender, "Only doctor can confirm");
        require(!appointment.confirmed, "Appointment already confirmed");
        require(!appointment.cancelled, "Appointment was cancelled");
        
        appointment.confirmed = true;
        emit AppointmentConfirmed(_id);
    }

    function completeAppointment(uint256 _id) external {
        Appointment storage appointment = appointments[_id];
        require(appointment.doctor == msg.sender, "Only doctor can complete");
        require(appointment.confirmed, "Appointment not confirmed");
        require(!appointment.completed, "Appointment already completed");
        require(!appointment.cancelled, "Appointment was cancelled");
        
        appointment.completed = true;
        payable(appointment.patient).transfer(appointment.deposit);
        
        emit AppointmentCompleted(_id);
        emit DepositRefunded(_id, appointment.patient, appointment.deposit);
    }

    function cancelAppointment(uint256 _id) external {
        Appointment storage appointment = appointments[_id];
        require(
            appointment.patient == msg.sender || appointment.doctor == msg.sender,
            "Only patient or doctor can cancel"
        );
        require(!appointment.completed, "Appointment already completed");
        require(!appointment.cancelled, "Appointment already cancelled");
        
        appointment.cancelled = true;
        
        // Refund deposit if cancelled by doctor or if cancelled well in advance
        if (appointment.doctor == msg.sender || 
            (appointment.timestamp - block.timestamp) > 24 hours) {
            payable(appointment.patient).transfer(appointment.deposit);
            emit DepositRefunded(_id, appointment.patient, appointment.deposit);
        }
        
        emit AppointmentCancelled(_id);
    }

    function getAppointment(uint256 _id) external view returns (
        uint256 id,
        address patient,
        address doctor,
        uint256 timestamp,
        uint256 deposit,
        bool confirmed,
        bool completed,
        bool cancelled
    ) {
        Appointment storage appointment = appointments[_id];
        return (
            appointment.id,
            appointment.patient,
            appointment.doctor,
            appointment.timestamp,
            appointment.deposit,
            appointment.confirmed,
            appointment.completed,
            appointment.cancelled
        );
    }
} 