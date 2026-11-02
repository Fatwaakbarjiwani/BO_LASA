import Transaksi from "../assets/mail-05.svg";
import TransaksiWhite from "../assets/mailwhite.svg";
import Amil from "../assets/coin-hand.svg";
import AmilWhite from "../assets/coinwhite.svg";

export const menuItemsKeuangan = [
  {
    src: Transaksi,
    srcActive: TransaksiWhite,
    title: "Transaksi",
    route: "/transaksi",
  },
  {
    src: Transaksi,
    srcActive: TransaksiWhite,
    title: "Administrasi",
    route: "/administrasi",
  },
  { src: Amil, srcActive: AmilWhite, title: "Wakaf", route: "/wakaf" },
];
