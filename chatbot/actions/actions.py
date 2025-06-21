# This files contains your custom actions which can be used to run
# custom Python code.
#
# See this guide on how to implement these action:
# https://rasa.com/docs/rasa/custom-actions


# This is a simple example for a custom action which utters "Hello World!"

# from typing import Any, Text, Dict, List
#
# from rasa_sdk import Action, Tracker
# from rasa_sdk.executor import CollectingDispatcher
#
#
# class ActionHelloWorld(Action):
#
#     def name(self) -> Text:
#         return "action_hello_world"
#
#     def run(self, dispatcher: CollectingDispatcher,
#             tracker: Tracker,
#             domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
#
#         dispatcher.utter_message(text="Hello World!")
#
#         return []

import pymongo
from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.forms import FormValidationAction
from dotenv import load_dotenv
from datetime import datetime, timedelta
from pymongo import MongoClient
import os
import re
import logging
load_dotenv()

logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger(__name__)

class MongoDBConnection:
    def __init__(self):
        # Kết nối MongoDB (thay đổi URL và thông tin kết nối của bạn)
        self.client = pymongo.MongoClient(os.getenv("MONGODB_URI"))
        self.db = self.client['test']  # tên db
        self.collection = self.db['vouchers']  # tên collection

class ValidateVoucherSearchForm(FormValidationAction):
    def name(self) -> Text:
        return "validate_voucher_search_form"

    def validate_category(self, slot_value: Any, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> Dict[Text, Any]:
        valid_categories = ["thời trang", "điện tử", "ẩm thực", "điện máy", "thực phẩm"]
        if slot_value and slot_value.lower() in valid_categories:
            return {"category": slot_value.lower()}
        dispatcher.utter_message(text="Category không hợp lệ. Vui lòng chọn: thời trang, điện tử, ẩm thực, điện máy, thực phẩm.")
        return {"category": None}

    def validate_platform(self, slot_value: Any, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> Dict[Text, Any]:
        valid_platforms = ["shopee", "lazada", "tiki", "grab", "fpt shop", "thế giới di động", "điện máy xanh", "fpt play"]
        if slot_value and slot_value.lower() in valid_platforms:
            return {"platform": slot_value.lower()}
        dispatcher.utter_message(text="Nền tảng không hợp lệ. Vui lòng chọn: Shopee, Lazada, Tiki, Grab, FPT Shop, Thế Giới Di Động, Điện Máy Xanh, FPT Play.")
        return {"platform": None}

    def validate_discount(self, slot_value: Any, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> Dict[Text, Any]:
        if slot_value and slot_value.endswith("%"):
            try:
                percentage = float(slot_value[:-1])
                if 0 <= percentage <= 100:
                    return {"discount": slot_value}
            except ValueError:
                pass
        dispatcher.utter_message(text="Discount phải là phần trăm từ 0-100% (VD: 20%).")
        return {"discount": None}

    def validate_price(self, slot_value: Any, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> Dict[Text, Any]:
        amount_regex = r"^\d{1,3}(?:\.\d{3})*(?:\s*(?:[kK]|[mM]|[đĐ]|nghìn|triệu|đồng))$"
        if slot_value and re.match(amount_regex, slot_value):
            return {"price": slot_value}
        dispatcher.utter_message(text="Giá trị không hợp lệ. Vui lòng nhập số tiền (VD: 100k, 1 triệu).")
        return {"price": None}

    def validate_expiration(self, slot_value: Any, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> Dict[Text, Any]:
        if slot_value in ["hôm nay", "ngày mai", "ngày mốt"]:
            return {"expiration": slot_value}
        try:
            datetime.strptime(slot_value, "%d/%m/%Y")
            return {"expiration": slot_value}
        except ValueError:
            try:
                datetime.strptime(slot_value, "%d-%m-%Y")
                return {"expiration": slot_value}
            except ValueError:
                dispatcher.utter_message(text="Ngày không hợp lệ. Vui lòng nhập định dạng DD/MM/YYYY hoặc 'hôm nay', 'ngày mai', 'ngày mốt'.")
                return {"expiration": None}

class ActionGetVoucherByCategory(MongoDBConnection, Action):
    def name(self) -> Text:
        return "action_get_voucher_by_category"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        category = tracker.get_slot("category")
        if not category:
            dispatcher.utter_message(text="Vui lòng cung cấp danh mục để tìm voucher.")
            return []
        try:
            logger.info(f"Querying vouchers with category: {category}")
            vouchers = self.collection.find({"category": category}).limit(10)

            voucher_list = []
            for voucher in vouchers:
                platform = voucher.get('platform', 'Không có thông tin')
                category = voucher.get('category', 'Không có thông tin')


                discount = voucher.get('discountValue', 'Không có thông tin')
                price = voucher.get('price', 'Không có thông tin')


                code = voucher.get('code', 'Không có thông tin')

                expiration = voucher.get('expirationDate', 'Không có thông tin') 

                rating = voucher.get('rating', 'Không có thông tin')
                
                voucher_info = (
                    f"Nền tảng: {platform}\n"
                    f"Danh mục: {category}\n"
                    f"Giảm giá: {discount}\n"
                    f"Giá: {price}\n" 
                    f"Mã: {code}\n"
                    f"Hạn sử dụng: {expiration}\n"
                    f"Đánh giá: {rating}/5\n"
                    "-----------------------------"
                )
                voucher_list.append(voucher_info)
            if voucher_list:
                message = "Đây là những voucher bạn muốn tìm:\n"
                for i, voucher_info in enumerate(voucher_list, start=1):
                    message += f"Voucher {i}:\n{voucher_info}\n"
                dispatcher.utter_message(text=message)
            else:
                dispatcher.utter_message(text="Không tìm thấy voucher nào phù hợp với yêu cầu của bạn.")
        except pymongo.errors.PyMongoError as e:
            dispatcher.utter_message(text="Lỗi khi truy vấn voucher. Vui lòng thử lại sau.")
            logger.error(f"MongoDB Error: {str(e)}")
        return []

class ActionGetVoucherByPlatform(MongoDBConnection, Action):
    def name(self) -> Text:
        return "action_get_voucher_by_platform"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        platform = tracker.get_slot("platform")
        if not platform:
            dispatcher.utter_message(text="Vui lòng cung cấp nền tảng để tìm voucher.")
            return []
        try:
            logger.info(f"Querying vouchers with platform: {platform}")
            vouchers = self.collection.find({"platform": platform}).limit(10)

            voucher_list = []
            for voucher in vouchers:
                platform = voucher.get('platform', 'Không có thông tin')
                category = voucher.get('category', 'Không có thông tin')


                discount = voucher.get('discountValue', 'Không có thông tin')
                price = voucher.get('price', 'Không có thông tin')


                code = voucher.get('code', 'Không có thông tin')

                expiration = voucher.get('expirationDate', 'Không có thông tin') 

                rating = voucher.get('rating', 'Không có thông tin')
                
                voucher_info = (
                    f"Nền tảng: {platform}\n"
                    f"Danh mục: {category}\n"
                    f"Giảm giá: {discount}\n"
                    f"Giá: {price}\n" 

                    f"Mã: {code}\n"



                    f"Hạn sử dụng: {expiration}\n"
                    f"Đánh giá: {rating}/5\n"
                    "-----------------------------"
                )
                voucher_list.append(voucher_info)           

            if voucher_list:
                message = "Đây là những voucher bạn muốn tìm:\n"
                for i, voucher_info in enumerate(voucher_list, start=1):
                    message += f"Voucher {i}:\n{voucher_info}\n"
                dispatcher.utter_message(text=message)
            else:
                dispatcher.utter_message(text="Không tìm thấy voucher nào phù hợp với yêu cầu của bạn.")
        except pymongo.errors.PyMongoError as e:
            dispatcher.utter_message(text="Lỗi khi truy vấn voucher. Vui lòng thử lại sau.")
            logger.error(f"MongoDB Error: {str(e)}")
        return []
    
class ActionGetVoucherByDiscount(MongoDBConnection, Action):
    def name(self) -> Text:
        return "action_get_voucher_by_discount"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        discount = tracker.get_slot("discountValue")
        if not discount:
            dispatcher.utter_message(text="Vui lòng cung cấp mức giảm giá để tìm voucher.")
            return []
        try:
            logger.info(f"Querying vouchers with discount: {discount}")
            vouchers = self.collection.find({"discount": discount}).limit(10)

            voucher_list = []
            for voucher in vouchers:
                platform = voucher.get('platform', 'Không có thông tin')
                category = voucher.get('category', 'Không có thông tin')


                discount = voucher.get('discountValue', 'Không có thông tin')
                price = voucher.get('price', 'Không có thông tin')


                code = voucher.get('code', 'Không có thông tin')

                expiration = voucher.get('expirationDate', 'Không có thông tin') 

                rating = voucher.get('rating', 'Không có thông tin')
                
                voucher_info = (
                    f"Nền tảng: {platform}\n"
                    f"Danh mục: {category}\n"
                    f"Giảm giá: {discount}\n"
                    f"Giá: {price}\n" 

                    f"Mã: {code}\n"



                    f"Hạn sử dụng: {expiration}\n"
                    f"Đánh giá: {rating}/5\n"
                    "-----------------------------"
                )
                voucher_list.append(voucher_info)

            if voucher_list:
                message = "Đây là những voucher bạn muốn tìm:\n"
                for i, voucher_info in enumerate(voucher_list, start=1):
                    message += f"Voucher {i}:\n{voucher_info}\n"
                dispatcher.utter_message(text=message)
            else:
                dispatcher.utter_message(text="Không tìm thấy voucher nào phù hợp với yêu cầu của bạn.")
        except pymongo.errors.PyMongoError as e:
            dispatcher.utter_message(text="Lỗi khi truy vấn voucher. Vui lòng thử lại sau.")
            logger.error(f"MongoDB Error: {str(e)}")
        return []
    
class ActionGetVoucherByExpiration(MongoDBConnection, Action):
    def name(self) -> Text:
        return "action_get_voucher_by_expiration"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        expiration = tracker.get_slot("expirationDate")
        if not expiration:
            dispatcher.utter_message(text="Vui lòng cung cấp ngày hết hạn để tìm voucher.")
            return []

        query = {}
        if expiration in ["hôm nay", "ngày mai", "ngày mốt"]:
            today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            if expiration == "hôm nay":
                query["expiration"] = {
                    "$gte": today,
                    "$lt": today + timedelta(days=1)
                }
            elif expiration == "ngày mai":
                tomorrow = today + timedelta(days=1)
                query["expiration"] = {
                    "$gte": tomorrow,
                    "$lt": tomorrow + timedelta(days=1)
                }
            elif expiration == "ngày mốt":
                day_after = today + timedelta(days=2)
                query["expiration"] = {
                    "$gte": day_after,
                    "$lt": day_after + timedelta(days=1)
                }
        else:
            try:
                exp_date = datetime.strptime(expiration, "%d/%m/%Y")
                query["expiration"] = {
                    "$gte": exp_date,
                    "$lt": exp_date + timedelta(days=1)
                }
            except ValueError:
                try:
                    exp_date = datetime.strptime(expiration, "%d-%m-%Y")
                    query["expiration"] = {
                        "$gte": exp_date,
                        "$lt": exp_date + timedelta(days=1)
                    }
                except ValueError:
                    dispatcher.utter_message(text="Ngày hết hạn không hợp lệ.")
                    return []

        try:
            logger.info(f"Querying vouchers with expiration: {expiration}")
            vouchers = self.collection.find(query).limit(10)

            voucher_list = []
            for voucher in vouchers:
                platform = voucher.get('platform', 'Không có thông tin')
                category = voucher.get('category', 'Không có thông tin')


                discount = voucher.get('discountValue', 'Không có thông tin')
                price = voucher.get('price', 'Không có thông tin')


                code = voucher.get('code', 'Không có thông tin')

                expiration = voucher.get('expirationDate', 'Không có thông tin') 

                rating = voucher.get('rating', 'Không có thông tin')
                
                voucher_info = (
                    f"Nền tảng: {platform}\n"
                    f"Danh mục: {category}\n"
                    f"Giảm giá: {discount}\n"
                    f"Giá: {price}\n" 

                    f"Mã: {code}\n"



                    f"Hạn sử dụng: {expiration}\n"
                    f"Đánh giá: {rating}/5\n"
                    "-----------------------------"
                )
                voucher_list.append(voucher_info)

            if voucher_list:
                message = "Đây là những voucher bạn muốn tìm:\n"
                for i, voucher_info in enumerate(voucher_list, start=1):
                    message += f"Voucher {i}:\n{voucher_info}\n"
                dispatcher.utter_message(text=message)
            else:
                dispatcher.utter_message(text="Không tìm thấy voucher nào phù hợp với yêu cầu của bạn.")
        except pymongo.errors.PyMongoError as e:
            dispatcher.utter_message(text="Lỗi khi truy vấn voucher. Vui lòng thử lại sau.")
            logger.error(f"MongoDB Error: {str(e)}")
        return []
    
class ActionGetVoucherByPrice(MongoDBConnection, Action):
    def name(self) -> Text:
        return "action_get_voucher_by_price"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        price = tracker.get_slot("price")
        if not price:
            dispatcher.utter_message(text="Vui lòng cung cấp giá trị voucher để tìm.")
            return []
        try:
            logger.info(f"Querying vouchers with price: {price}")
            vouchers = self.collection.find({"price": price}).limit(10)

            voucher_list = []
            for voucher in vouchers:
                platform = voucher.get('platform', 'Không có thông tin')
                category = voucher.get('category', 'Không có thông tin')


                discount = voucher.get('discountValue', 'Không có thông tin')
                price = voucher.get('price', 'Không có thông tin')


                code = voucher.get('code', 'Không có thông tin')

                expiration = voucher.get('expirationDate', 'Không có thông tin') 

                rating = voucher.get('rating', 'Không có thông tin')
                
                voucher_info = (
                    f"Nền tảng: {platform}\n"
                    f"Danh mục: {category}\n"
                    f"Giảm giá: {discount}\n"
                    f"Giá: {price}\n" 

                    f"Mã: {code}\n"



                    f"Hạn sử dụng: {expiration}\n"
                    f"Đánh giá: {rating}/5\n"
                    "-----------------------------"
                )
                voucher_list.append(voucher_info)
            if voucher_list:
                message = "Đây là những voucher bạn muốn tìm:\n"
                for i, voucher_info in enumerate(voucher_list, start=1):
                    message += f"Voucher {i}:\n{voucher_info}\n"
                dispatcher.utter_message(text=message)
            else:
                dispatcher.utter_message(text="Không tìm thấy voucher nào phù hợp với yêu cầu của bạn.")
        except pymongo.errors.PyMongoError as e:
            dispatcher.utter_message(text="Lỗi khi truy vấn voucher. Vui lòng thử lại sau.")
            logger.error(f"MongoDB Error: {str(e)}")
        return []
    
class ActionSearchVoucher(MongoDBConnection, Action):
    def name(self) -> Text:
        return "action_search_voucher"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        category = tracker.get_slot("category")
        platform = tracker.get_slot("platform")
        discount = tracker.get_slot("discount")
        price = tracker.get_slot("price")
        expiration = tracker.get_slot("expiration")

        query = {}

        if category:
            query["category"] = category
        if platform:
            query["platform"] = platform
        if discount:
            query["discountValue"] = discount
        if price:
            query["price"] = price

        if expiration:
            today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            if expiration == "hôm nay":
                query["expirationDate"] = {
                    "$gte": today,
                    "$lt": today + timedelta(days=1)
                }
            elif expiration == "ngày mai":
                tomorrow = today + timedelta(days=1)
                query["expirationDate"] = {
                    "$gte": tomorrow,
                    "$lt": tomorrow + timedelta(days=1)
                }
            elif expiration == "ngày mốt":
                day_after = today + timedelta(days=2)
                query["expirationDate"] = {
                    "$gte": day_after,
                    "$lt": day_after + timedelta(days=1)
                }
            else:
                try:
                    exp_date = datetime.strptime(expiration, "%d/%m/%Y")
                    query["expirationDate"] = {
                        "$gte": exp_date,
                        "$lt": exp_date + timedelta(days=1)
                    }
                except ValueError:
                    try:
                        exp_date = datetime.strptime(expiration, "%d-%m-%Y")
                        query["expirationDate"] = {
                            "$gte": exp_date,
                            "$lt": exp_date + timedelta(days=1)
                        }
                    except ValueError:
                        dispatcher.utter_message(text="Ngày hết hạn không hợp lệ.")
                        return []

        try:
            logger.info(f"Tìm voucher với điều kiện: {query}")
            vouchers = self.collection.find(query).limit(10)

            voucher_list = []
            for voucher in vouchers:
                platform = voucher.get('platform', 'Không có thông tin')
                category = voucher.get('category', 'Không có thông tin')
                discount = voucher.get('discountValue', 'Không có thông tin')
                price = voucher.get('price', 'Không có thông tin')
                code = voucher.get('code', 'Không có thông tin')
                expiration = voucher.get('expirationDate', 'Không có thông tin')
                rating = voucher.get('rating', 'Không có thông tin')

                voucher_info = (
                    f"Nền tảng: {platform}\n"
                    f"Danh mục: {category}\n"
                    f"Giảm giá: {discount}\n"
                    f"Giá: {price}\n"
                    f"Mã: {code}\n"
                    f"Hạn sử dụng: {expiration}\n"
                    f"Đánh giá: {rating}/5\n"
                    "-----------------------------"
                )
                voucher_list.append(voucher_info)

            if voucher_list:
                message = "Đây là những voucher bạn muốn tìm:\n"
                for i, voucher_info in enumerate(voucher_list, start=1):
                    message += f"Voucher {i}:\n{voucher_info}\n"
                dispatcher.utter_message(text=message)
            else:
                dispatcher.utter_message(text="Không tìm thấy voucher nào phù hợp với yêu cầu của bạn.")
        except pymongo.errors.PyMongoError as e:
            dispatcher.utter_message(text="Lỗi khi truy vấn dữ liệu. Vui lòng thử lại sau.")
            logger.error(f"MongoDB Error: {str(e)}")
        return []

    



