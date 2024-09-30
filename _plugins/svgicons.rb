module Jekyll
  class SvgiconTag < Liquid::Tag

    def initialize(tag_name, icon, tokens)
      super
      @icon = icon.gsub(/\s+/, "")
    end

    def render(context)
      "<svg class=\"icon-#{@icon}\"><use xlink:href=\"/assets/images/graphics/svg-symbols.svg\##{@icon}\"></use></svg>"
    end
  end
end

Liquid::Template.register_tag('svgicon', Jekyll::SvgiconTag)
