using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Text;

namespace Seogwipean.Data
{
    /// <summary>
    /// DbContext 를 생성하는 Factory 클래스
    /// </summary>
    public class HotelSeogwipeanDbContextFactory
    {
        private readonly IConfiguration configuration;

        public HotelSeogwipeanDbContextFactory(IConfiguration configuration)
        {
            this.configuration = configuration;
        }

        public SeogwipeanDbContext Create()
        {
            var optionBuilder = new DbContextOptionsBuilder<SeogwipeanDbContext>();

            return new SeogwipeanDbContext(configuration.GetConnectionString("DefaultConnection"));
        }

        public SeogwipeanDbContext Create(string connectionName)
        {
            var optionBuilder = new DbContextOptionsBuilder<SeogwipeanDbContext>();

            return new SeogwipeanDbContext(configuration.GetConnectionString(connectionName + "Connection"));
        }
    }
}
