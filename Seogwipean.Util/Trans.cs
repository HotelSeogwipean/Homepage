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
            + "            \"title\": \""+Uri.EscapeDataString("피드 메시지")+"\",\n"
            + "            \"description\": \"" + Uri.EscapeDataString("피드 메시지 기본 템플릿") + "\",\n"
            + "            \"image_url\": \"https://developers.kakao.com/static/images/pc/product/kakaoLogin.png\",\n"
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
