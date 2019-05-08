using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

namespace Seogwipean.Util
{
    public static class Common
    {
        public static readonly int Success = 1;
        public static readonly int Fail = 0;
        public static readonly int Exception = -1;

        /// <summary>
        /// 문자열을 SHA256 문자열로 변환
        /// </summary>
        /// <param name="str">문자열</param>
        /// <returns></returns>
        public static string ToHashString(string str)
        {
            if (string.IsNullOrEmpty(str))
            {
                return str;
            }

            var sha = SHA256.Create();
            var data = sha.ComputeHash(Encoding.UTF8.GetBytes(str));
            var hash = BitConverter.ToString(data).Replace("-", "");

            return hash;
        }


        public static List<long> GetLongValuesFromString(string str)
        {
            List<long> list = null;

            if (string.IsNullOrEmpty(str))
            {
                return new List<long>();
            }

            list = str.Split(new char[] { ',' })
                .Select(s => long.Parse(s))
                .ToList();

            return list;
        }

        public static string GetStringFromLongValues(List<long> list)
        {
            if (list == null ||
                list.Count == 0)
            {
                return "";
            }

            string result = "";

            foreach (var item in list)
            {
                if (result.Length > 0)
                {
                    result = result + "," + item.ToString();
                }
                else
                {
                    result = item.ToString();
                }
            }

            return result;
        }

    }
}