=begin
    Localization Plugin

    Developed by Jae Hee Lee @ 2017

    Dependencies: jekyll-polyglot

    Please make sure you have the necessary dependency before using this custom tag.
=end

module Jekyll
  class LocalizeTag < Liquid::Tag

    # Lookup allows access to the page/post variables through the tag context
    def lookup(context, name)
        lookup = context
        name.split(".").each { |value| lookup = lookup[value] }
        lookup
    end

    def initialize(tag_name, variables, tokens)
    	super
        @words = JSON.parse(IO.read(File.join(File.dirname(__FILE__), '../_data/localization.json')))
        @init = variables.split(" ")
        if @init[0] != 'word'
            @variables = variables.split(" ")
            @string = @variables[0]
            @word = @words[@string]
        end
        @record = 'nothing'
    end

    def render(context)
        @language = "#{lookup(context, 'site.active_lang')}"
        if @variables.nil?
            @keyword = "#{lookup(context, 'word')}"
            if @keyword.nil?
                @keyword = 'nothing'
            end
            @word = @words[@keyword]
        end
        if !@word.nil?
            @word.each do |record|
                if record.key?(@language)
                    @record = record[@language]
                    break
                end
            end
        else
            @record = 'nothing'
        end
        "#{@record}"
    end
  end
end

Liquid::Template.register_tag('localize', Jekyll::LocalizeTag)
