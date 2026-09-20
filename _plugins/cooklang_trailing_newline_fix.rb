# Workaround for cooklang_rb 0.2.0, which infinite-loops when parsing
# content that does not end with a newline (e.g. Jekyll excerpts).
# Remove this once the upstream gem fixes the bug.
module Jekyll
  module Converters
    module Cooklang
      class RecipeParser
        alias_method :parse_original, :parse

        def parse(content)
          content = "#{content}\n" unless content.end_with?("\n")
          parse_original(content)
        end
      end
    end
  end
end
