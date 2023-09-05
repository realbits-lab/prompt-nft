import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { shortenAddress } from "@/lib/util";

export default function Settings() {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="center">Key</TableCell>
            <TableCell align="center">Value</TableCell>
            <TableCell align="center">Description</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
            <TableCell align="left">BLOCKCHAIN_NETWORK</TableCell>
            <TableCell align="left">
              {process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK}
            </TableCell>
            <TableCell align="left" sx={{ color: "grey" }}>
              The blockchain network which this service should use
            </TableCell>
          </TableRow>

          <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
            <TableCell align="left">RENT_MARKET_CONTRACT_ADDRESS</TableCell>
            <TableCell align="left">
              {shortenAddress({
                address: process.env.NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS,
                withLink: "scan",
                number: 20,
              })}
            </TableCell>
            <TableCell align="left" sx={{ color: "grey" }}>
              The rent market contract address
            </TableCell>
          </TableRow>

          <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
            <TableCell align="left">PROMPT_NFT_CONTRACT_ADDRESS</TableCell>
            <TableCell align="left">
              {shortenAddress({
                address: process.env.NEXT_PUBLIC_PROMPT_NFT_CONTRACT_ADDRESS,
                withLink: "scan",
                number: 20,
              })}
            </TableCell>
            <TableCell align="left" sx={{ color: "grey" }}>
              The prompt NFT contract address. Image will be stored in the
              prompt NFT when minting.
            </TableCell>
          </TableRow>

          <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
            <TableCell align="left">SERVICE_ACCOUNT_ADDRESS</TableCell>
            <TableCell align="left">
              {shortenAddress({
                address: process.env.NEXT_PUBLIC_SERVICE_ACCOUNT_ADDRESS,
                withLink: "scan",
                number: 20,
              })}
            </TableCell>
            <TableCell align="left" sx={{ color: "grey" }}>
              The service owner account address. The service owner will get 10%
              from NFT rent fee.
            </TableCell>
          </TableRow>

          <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
            <TableCell align="left">PAYMENT_NFT_ADDRESS</TableCell>
            <TableCell align="left">
              {shortenAddress({
                address: process.env.NEXT_PUBLIC_PAYMENT_NFT_ADDRESS,
                withLink: "scan",
                number: 20,
              })}
            </TableCell>
            <TableCell align="left" sx={{ color: "grey" }}>
              The NFT contract address which is used for service usage
            </TableCell>
          </TableRow>

          <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
            <TableCell align="left">PAYMENT_NFT_TOKEN</TableCell>
            <TableCell align="left">
              {process.env.NEXT_PUBLIC_PAYMENT_NFT_TOKEN}
            </TableCell>
            <TableCell align="left" sx={{ color: "grey" }}>
              The NFT id which is used for service usage
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
