{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-24.11";
    utils.url = "github:numtide/flake-utils";
  };
  outputs =
    {
      nixpkgs,
      utils,
      ...
    }:
    utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs { inherit system; };
        deps = [ pkgs.bun ];
      in
      {
        devShell = pkgs.mkShell { buildInputs = deps; };
        apps.default = utils.lib.mkApp {
          drv = pkgs.writeShellApplication {
            name = "chatwick";
            runtimeInputs = deps;
            text = ''
              bun i
              bun main.ts
            '';
          };
        };
      }
    );
}
