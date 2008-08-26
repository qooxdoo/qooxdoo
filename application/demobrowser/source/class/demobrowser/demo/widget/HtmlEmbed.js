/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

************************************************************************ */

qx.Class.define("demobrowser.demo.widget.HtmlEmbed",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var box = new qx.ui.layout.VBox();
      box.setSpacing(10);

      var container = new qx.ui.container.Composite(box);
      container.setPadding(20);

      this.getRoot().add(container);


      // Example HTML embed
      var html1 = "<div style='background-color: white; text-align: center;'>" +
                    "<i style='color: red;'><b>H</b></i>" +
                    "<b>T</b>" +
                    "<u>M</u>" +
                    "<i>L</i>" +
                    " Text" +
                  "</div>";
      var embed1 = new qx.ui.embed.Html(html1);
      embed1.setWidth(300);
      embed1.setHeight(20);
      embed1.setDecorator("main");
      container.add(embed1);


      // Example HTML embed with set font
      var html2 = "Text with set font (bold)!";
      var embed2 = new qx.ui.embed.Html(html2);
      embed2.setFont("bold");
      embed2.setHeight(20);
      embed2.setDecorator("main");
      container.add(embed2);


      // Rich content
      var rich = 'Mr. Kennedy&#8217;s appearance wiped away, at least for the evening, some of the tension that continued to plague the party in the wake of the primary fight between Mr. Obama and Senator <a href="http://topics.nytimes.com/top/reference/timestopics/people/c/hillary_rodham_clinton/index.html?inline=nyt-per" title="More articles about Hillary Rodham Clinton.">Hillary Rodham Clinton</a>. It also represented an effort by the Obama campaign to claim the Kennedy mantle, and it set the stage for the second part of what was designed to be an emotionally powerful two-act evening: an appearance later by <a href="http://topics.nytimes.com/top/reference/timestopics/people/o/michelle_obama/index.html?inline=nyt-per" title="More articles about Michelle Obama.">Michelle Obama</a>, who began a weeklong effort to present her husband — and his entire family — as embodiments of the American dream.</p><p>"You see, Barack doesn&#8217;t care where you&#8217;re from, or what your background is, or what party, if any, you belong to," said Mrs. Obama, without explicitly mentioning the racial undercurrents that have swirled around her husband&#8217;s candidacy. "You see, that&#8217;s just not how he sees the world. He knows that thread that connects us — our belief in America&#8217;s promise, our commitment to our children&#8217;s future — he knows that that thread is strong enough to hold us together as one nation even when we disagree."</p><p>At the end of the evening&#8217;s proceedings, Mr. Obama appeared before the convention by video hookup, with his young daughters, Malia and Sasha, joining his wife on stage for what was clearly intended to transmit a loving American family tableau. </p><p>Even as Mrs. Obama led the effort to present a warm and positive portrayal of her husband during the portion of the proceedings broadcast by network television, Democrats moved aggressively earlier in the proceedings to portray his likely Republican opponent, Senator <a href="http://topics.nytimes.com/top/reference/timestopics/people/m/john_mccain/index.html?inline=nyt-per" title="More articles about John McCain.">John McCain</a> of Arizona, in harsh terms. In an early taste of coming efforts to define Mr. McCain negatively, they attacked him for his ties to President Bush, his opposition to abortion rights and as being out of touch with the concerns of ordinary Americans.</p><p> "Republicans say John McCain has experience," said Representative <a href="http://topics.nytimes.com/top/reference/timestopics/people/p/nancy_pelosi/index.html?inline=nyt-per" title="More articles about Nancy Pelosi.">Nancy Pelosi</a> of California, the House speaker. "We say John McCain has the experience of being wrong."</p><p>As elaborately choreographed as the evening was, with a series of speeches carefully screened by the Obama campaign, it was marked by an event that no was sure until the very last moment would happen, given the severity of Mr. Kennedy&#8217;s illness. He arrived at the convention site here shortly before dusk, accompanied by a flock of family members. He walked a few halting steps to a waiting golf cart, which drove him into the arena.</p><p>After a speech by his niece <a href="http://topics.nytimes.com/top/reference/timestopics/people/s/caroline_kennedy_schlossberg/index.html?inline=nyt-per" title="More articles about Caroline Kennedy Schlossberg.">Caroline Kennedy</a> and a video tribute, Mr. Kennedy walked slowly to the lectern, limping slightly, with his wife, Victoria, who kissed him and left him there. His white head of hair was noticeably thinned in the back; throughout the speech, he stared straight ahead to the front of the room. The crowd, many of them wiping tears from their eyes, cheered for close to two minutes until he settled them down.</p><p>"My fellow Democrats, my fellow Americans, it is so wonderful to be here," said Mr. Kennedy, his voice booming across the hall. "And nothing — nothing — is going to keep me away from this special gathering tonight."</p><p>A stool that had been slipped behind him went unused during his 10-minute speech. And while Mr. Kennedy spoke slowly and at times haltingly, his voice was firm and he was in command of this moment, gesturing and sounding very much like the man who enraptured the party&#8217;s convention 28 years ago.</p>';

      var richWidget = new qx.ui.embed.Html(rich);
      richWidget.setOverflow("auto", "auto");
      richWidget.setDecorator("main");
      richWidget.setBackgroundColor("white");
      richWidget.setWidth(200);
      richWidget.setHeight(200);
      container.add(richWidget);
    }
  }
});
