# Tokens
## Layer1
- KLAY
- MHN(Mehefin)
- NKS (Nuuk 7 Game) 
- MBX (MarbleX)
- WEMIX
 
## Layer2 
- MHN-V (Mehefin Verse) 
- MHN-T01 (Mehefin ERC20 Token 01) 
- MHN-NFT01 (Mehefin NFT 01) 
- ATX (Attu X Game) 
- MBXL (MarbleX Link)
- WEMIX CREDIT
-
## Layer3
- MTC(CMultiverse Cafe Game)
- UVF(Universe Farm Game)
- INETRIUM (A3:Still Alive)
- FELCO (Every Farm)

## Mehefin 
- Name : mehefin
- Service Chain EN RPC endpoints : [10.1.0.17:8551]
- Service Chain ID : 7212
 
### Parent (Layer1)
- MHN Bridge Contract Address : 0x11aaff44bc37e12d97e9e8eacc77bec2024bf3d1
- MHN ERC20 Token Contract Address : 0x33bbee882a96be0b443f213021cdc7b861ffcb8e
- MHN NFT Token Contract Address : 0xdd2255ee2a96be0b443f213021cdc7b861ffcb8e

### Child (Layer2)
- MHNV Bridge Contract Address : 0x22bbee55bc37e12d97e9e8eacc77bec2024bf3d1
- MHNV Token Contract Address : 0x44ccdd772a96be0b443f213021cdc7b861ffcb8e
- MHN-NFT01 NFT Token Contract Address : 0xee3366bb2a96be0b443f213021cdc7b861ffcb8e

### NKS
- Name : Nuuk 7 Game 
- Service Chain EN RPC endpoint : [117.3.1.5:8551]
- Service Chain ID : 70001

# APIs
## 등록된 메인넷 토큰 리스트 
- 메인넷에 등록된 토큰 목록을 볼 수 있다
- 메인넷에 있는 토큰들은 서로 교환할 수 있다
- 토큰들 간에 교환 비율을 알 수 있다
 
## 브릿징된 서비스 체인 리스트 
- 메인넷에 있는 브릿지 정보를 알 수 있다
  - 브릿지 이름, 접속 정보
- 서비스체인에 있는 토큰 리스트를 가져 온다
- 메인 체인 토큰과 서비스 체인 토큰 교환이 되어야 한다
- 레이어3로 확장 가능해야 한다
  - 레이어3 체인 목록을 가져와야 한다
  - 레이어3 체인의 토큰들을 가져 온다
  - 레이어3 체인의 토큰들은 서로 교환이 가능하다
- api name : chainList
- request params : none
- response : Chain list
  - ```json 
    [ 
      {"chainName": "Mehefin", "chainId": 7212 },
      {"chainName": "Nuuk 7", "chainId": 70001 },
    ]
   ```