export const EHRContract = {
  abi: [
    {
      inputs: [
        { internalType: 'uint256', name: 'userId', type: 'uint256' },
        { internalType: 'string', name: 'role', type: 'string' },
        { internalType: 'bytes32', name: 'username', type: 'bytes32' },
      ],
      name: 'registerUser',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'uint256', name: 'userId', type: 'uint256' }],
      name: 'verifyUser',
      outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'uint256', name: 'patientId', type: 'uint256' }],
      name: 'getMedicalRecords',
      outputs: [
        {
          components: [
            { internalType: 'uint256', name: 'id', type: 'uint256' },
            { internalType: 'uint256', name: 'patientId', type: 'uint256' },
            { internalType: 'uint256', name: 'doctorId', type: 'uint256' },
            { internalType: 'bytes32', name: 'diagnosis', type: 'bytes32' },
            { internalType: 'bytes32', name: 'prescription', type: 'bytes32' },
            { internalType: 'bytes32', name: 'notes', type: 'bytes32' },
            { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
          ],
          internalType: 'struct EHR.MedicalRecord[]',
          name: '',
          type: 'tuple[]',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        { internalType: 'uint256', name: 'patientId', type: 'uint256' },
        { internalType: 'uint256', name: 'doctorId', type: 'uint256' },
        { internalType: 'bytes32', name: 'diagnosis', type: 'bytes32' },
        { internalType: 'bytes32', name: 'prescription', type: 'bytes32' },
        { internalType: 'bytes32', name: 'notes', type: 'bytes32' },
      ],
      name: 'addMedicalRecord',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ],
}; 