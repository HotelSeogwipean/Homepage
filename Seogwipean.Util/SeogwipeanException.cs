using System;

namespace Seogwipean.Util
{
    public class SeogwipeanException : Exception
    {
        public SeogwipeanException()
        {
        }

        public SeogwipeanException(string message)
            : base(message)
        {
        }

        public SeogwipeanException(string message, Exception inner)
            : base(message, inner)
        {
        }
    }
}
