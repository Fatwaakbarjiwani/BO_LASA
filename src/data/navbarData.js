import Box from "../assets/box.svg";
import BoxWhite from "../assets/box-white.svg";
import Campaign from "../assets/bank-note-02.svg";
import CampaignWhite from "../assets/campaignwhite.svg";
import Pengguna from "../assets/user-profile-group.svg";
import PenggunaWhite from "../assets/profilewhite.svg";
import Transaksi from "../assets/mail-05.svg";
import TransaksiWhite from "../assets/mailwhite.svg";
import Amil from "../assets/coin-hand.svg";
import AmilWhite from "../assets/coinwhite.svg";
import Ziswaf from "../assets/indent-decrease.svg";
import ZiswafWhite from "../assets/indentwhite.svg";
import Distribusi from "../assets/bank-note-06.svg";
import DistribusiWhite from "../assets/distribusiwhite.svg";
import Berita from "../assets/book-04.svg";
import BeritaWhite from "../assets/bookwhite.svg";

export const menuItems = [
  { src: Box, srcActive: BoxWhite, title: "Dashboard", route: "/dashboard" },
  {
    src: Campaign,
    srcActive: CampaignWhite,
    title: "Campaign",
    route: "/campaign",
  },
  {
    src: Pengguna,
    srcActive: PenggunaWhite,
    title: "Pengguna",
    route: "/pengguna",
  },
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

  { src: Amil, srcActive: AmilWhite, title: "Amil", route: "/amil" },
  { src: Ziswaf, srcActive: ZiswafWhite, title: "Ziswaf", route: "/ziswaf" },
  {
    src: Distribusi,
    srcActive: DistribusiWhite,
    title: "Distribusi",
    route: "/distribusi",
  },
  { src: Berita, srcActive: BeritaWhite, title: "Berita", route: "/berita" },
  { src: Berita, srcActive: BeritaWhite, title: "Tampilan", route: "/tampilan" },
];
