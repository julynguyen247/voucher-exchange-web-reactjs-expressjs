
const {
  uploadImgService,
  createVoucherService,getVoucherService,
  deleteAVoucherService
} = require("../services/voucherService");
const createVoucher = async (req, res) => {
  const { title, category, discountValue, expirationDate, status } = req.body;
  const image = req.files.image;
  const result = await createVoucherService(
    title,
    category,
    image,
    discountValue,
    expirationDate,
    req.user.email,
    status,
  );
  return res.status(200).json({
    message: "Success",
    voucher: result,
  });

};
const handleUploadImg = async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  let result = await uploadImgService(req.files.image);

  return res.status(200).json({
    data: result,
  });
};
const getVoucher=async (req,res)=>{
  let limit=req.query.limit;
  let page=req.query.page;
  let result=null;
  if(limit && page)
    result=await getVoucherService(limit,page,req.query);
  else{
    result=await getVoucherService();
  }
    return res.status(200).json({
        data: result,
      });
}
const deleteVoucher = async (req, res) => {
  let id = req.body.id;
  let result = await deleteAVoucherService(id);
  return res.status(200).json(
    {
        EC: 0,
        data: result
    }
) 
};
const getPlatform=async(req,res)=>{
  let data=["Shopee","Lazada","Sendo","Tiki","Tiktok Shop","Amazon","eBay"]
  return res.status(200).json(
    {
        EC: 0,
        data: data
    }
  )
}
const getCategory= async(req,res)=>{
  let data=["Food & Drinks","Fashion & Jewelry","Beauty & Health","Electronics","Home & Living","Travel & Entertainment","Baby & Kids"];
  return res.status(200).json(
    {
        EC: 0,
        data: data
    }
  )
}
module.exports = { handleUploadImg, createVoucher,getVoucher,deleteVoucher,getPlatform,getCategory };
