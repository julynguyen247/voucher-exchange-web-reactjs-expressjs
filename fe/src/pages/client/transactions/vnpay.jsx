import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Result, Button, Spin } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import "../../../style/vnpayReturn.css";

const VnpayReturn = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [paymentStatus, setPaymentStatus] = useState({
        success: false,
        message: '',
        details: {}
    });

    useEffect(() => {
        // Lấy thông tin từ query params
        const params = new URLSearchParams(location.search);
        const vnp_ResponseCode = params.get('vnp_ResponseCode');
        const vnp_TxnRef = params.get('vnp_TxnRef');
        const vnp_Amount = params.get('vnp_Amount');
        const vnp_OrderInfo = params.get('vnp_OrderInfo');

        // Xử lý kết quả thanh toán
        if (vnp_ResponseCode === '00') {
            setPaymentStatus({
                success: true,
                message: 'Thanh toán thành công',
                details: {
                    orderId: vnp_TxnRef,
                    amount: parseInt(vnp_Amount) / 100, // Chuyển đổi từ đơn vị xu sang VND
                    orderInfo: vnp_OrderInfo
                }
            });
        } else {
            setPaymentStatus({
                success: false,
                message: 'Thanh toán thất bại',
                details: {
                    orderId: vnp_TxnRef,
                    responseCode: vnp_ResponseCode || 'Unknown'
                }
            });
        }

        setLoading(false);
    }, [location.search]);

    if (loading) {
        return (
            <div className="vnpay-return-container">
                <Spin size="large" />
                <p>Đang xử lý kết quả thanh toán...</p>
            </div>
        );
    }

    return (
        <div className="vnpay-return-container">
            {paymentStatus.success ? (
                <>
                    <CheckCircleOutlined className="success-icon" />
                    <h1>Thanh toán thành công!</h1>
                    <p>Mã giao dịch: {paymentStatus.details.orderId || 'N/A'}</p>
                    <p>Số tiền: {paymentStatus.details.amount?.toLocaleString('vi-VN') || 0} VNĐ</p>
                    <p>Nội dung: {paymentStatus.details.orderInfo || 'Thanh toán voucher'}</p>
                </>
            ) : (
                <>
                    <CloseCircleOutlined className="failed-icon" />
                    <h1>Thanh toán thất bại</h1>
                    <p>Mã giao dịch: {paymentStatus.details.orderId || 'N/A'}</p>
                    <p>Mã lỗi: {paymentStatus.details.responseCode || 'N/A'}</p>
                    <p>Vui lòng thử lại hoặc chọn phương thức thanh toán khác.</p>
                </>
            )}

            <div className="action-buttons">
                <Button
                    type="primary"
                    onClick={() => navigate('/user/transactions')}
                >
                    Xem lịch sử giao dịch
                </Button>
                <Button
                    onClick={() => navigate('/')}
                >
                    Trở về trang chủ
                </Button>
            </div>
        </div>
    );
};

export default VnpayReturn;