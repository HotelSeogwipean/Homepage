using Newtonsoft.Json.Linq;
using System;

namespace Seogwipean.Util
{
    public class Trans
    {
        public static String default_msg_param = ""
            + "template_object={\n"
            + "        \"object_type\": \"feed\",\n"
            + "        \"content\": {\n"
            + "            \"title\": \""+Uri.EscapeDataString("서귀피안 베이커리")+"\",\n"
            + "            \"description\": \"" + Uri.EscapeDataString("발급받으신 쿠폰을 확인하세요.") + "\",\n"
            + "            \"image_url\": \"https://seogwipean.net/img/SPP LOGO.png/\",\n"
            + "            \"link\": {\n"
            + "                \"web_url\": \"http://daum.net\",\n"
            + "                \"mobile_web_url\": \"http://dev.kakao.com\"\n"
            + "            }\n"
            + "        },\n"
            + "        \"social\": {\n"
            + "            \"like_count\": 100,\n"
            + "            \"comment_count\": 200\n"
            + "        },\n"
            + "        \"button_title\": \"" + Uri.EscapeDataString("바로 확인") + "\"\n"
            + "    }"
            + "";

        public static String token(String rtn)
        {
            return rtn;
            //return JObject.Parse(rtn).GetValue("access_token").ToString();
        }
    }
}
