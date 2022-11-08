export const ERC721_VALUE_TRANSFER_ABI = [
    'function balanceOf(address owner) public view returns (uint256)',
    'function ownerOf(uint256 tokenId) public view returns (address)',
    'function approve(address to, uint256 tokenId) public',
    'function requestValueTransfer(uint256 _uid, address _to, bytes calldata _extraData) external'
];
