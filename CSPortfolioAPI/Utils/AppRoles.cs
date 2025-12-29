namespace CSPortfolioAPI.Utils;

public static class AppRoles
{
    public const string NoEmailVerification  = nameof(NoEmailVerification);
    public const string Normal = nameof(Normal);
    public const string Mod    = nameof(Mod);
    public const string Admin  = nameof(Admin);

    public static readonly IReadOnlyList<string> All =
        [NoEmailVerification, Normal, Mod, Admin];
}