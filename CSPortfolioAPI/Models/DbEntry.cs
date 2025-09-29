using System.ComponentModel.DataAnnotations;

namespace CSPortfolioAPI.Models;

public abstract class DbEntry
{
    [Key]
    public int Id { get; set; }
}