for i in {0..60}
do
   URL="https://gwfd.qatgwawm.net/system-requirement/Web.Portal/_Common/Content/Views/Vip/images/vip"$i".png"
   echo "DOWNLOADING...  $URL"
   wget --no-check-certificate $URL
done