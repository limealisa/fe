/* eslint-disable react/no-unescaped-entities */
import Image from "next/image";
import Link from "next/link";
import Marquee from "react-fast-marquee";

/* eslint-disable @next/next/no-img-element */
export default function MarqueeDesktop() {
  return (
    <div className="lg:max-full w-full flex items-center justify-center  min-h-[34px]  max-md:hidden bg-[#444]">
      <div className="w-[1200px] flex items-center">
        <div className=" flex items-center justify-center px-2 gap-1 ">
          <Image
            width={29}
            height={23}
            className=" h-[23px] w-[29px]"
            loading="lazy"
            src="https://cdn.jsdelivr.net/gh/snail5555/akv@main/789bet/images/casino/loa.png"
            alt=""
          />
          <span className="uppercase text-[#f49a25] text-sm w-28">
            Thông báo
          </span>
        </div>
        <Marquee
          pauseOnHover
          gradientWidth={1000}
          className="max-w-[1140px] text-white text-[13px]  font-roHe marquee-custom"
        >
          <Link href={"/"}>
          LIÊN HỆ TELEGRAM DƯỚI ĐÂY ĐỂ LÀM VIỆC :
          </Link>
          <Link href={"/"}>
            🆘 https://t.me/numberone125⚠️ ( Chỉ Sử dụng telegram duy nhất )
          </Link>
          <Link href={"/"}>
            🆘https://t.me/numberone125⚠️ ( Chỉ Sử dụng telegram duy nhất )
          </Link>
          <Link href={"/"}>
            🆘https://t.me/numberone125⚠️ ( Chỉ Sử dụng telegram duy nhất )
          </Link>
          <Link href={"/"}>
            🆘https://t.me/numberone125⚠️ ( Chỉ Sử dụng telegram duy nhất )
          </Link>
          <Link href={"/"}>
            🆘https://t.me/numberone125⚠️ ( Chỉ Sử dụng telegram duy nhất )
          </Link>
          <Link href={"/"}>
            🆘https://t.me/numberone125⚠️ ( Chỉ Sử dụng telegram duy nhất )
          </Link>
          <Link href={"/"}>
            🆘https://t.me/numberone125⚠️ ( Chỉ Sử dụng telegram duy nhất )
          </Link>
          <Link href={"/"}>
            🆘https://t.me/numberone125⚠️ ( Chỉ Sử dụng telegram duy nhất )
          </Link>
          <Link href={"/"}>
            🆘https://t.me/numberone125⚠️ ( Chỉ Sử dụng telegram duy nhất )
          </Link>
        </Marquee>
      </div>
    </div>
  );
}
