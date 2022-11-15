export const ERC20_VALUE_TRANSFER_ABI = [
    'function totalSupply() public view returns (uint256)',
    'function balanceOf(address account) public view returns (uint256)',
    'function approve(address spender, uint256 value) public returns (bool)',
    'function requestValueTransfer(uint256 _amount, address _to, uint256 _feeLimit, bytes calldata _extraData) external',
    'function transfer(address recipient, uint256 amount) public returns (bool)'
];