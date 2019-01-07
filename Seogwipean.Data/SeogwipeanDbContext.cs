using Microsoft.EntityFrameworkCore;
using Seogwipean.Data.Models;

namespace Seogwipean.Data
{
    public class SeogwipeanDbContext : HotelSeogwipeanDbContext
    {
        private readonly string connectionString;

        public SeogwipeanDbContext(string connectionString)
        {
            this.connectionString = connectionString;
        }

        public string Content { get; internal set; }

        /// <summary>
        /// 연결 문자열을 외부에서 받아오기 위해 Sql Server 연결 문자열을 재설정하고, 로깅 추가
        /// </summary>
        /// <param name="optionsBuilder"></param>
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlServer(connectionString);
        }
    }
}
