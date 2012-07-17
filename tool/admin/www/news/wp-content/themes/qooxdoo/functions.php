<?php

/**
 * Display navigation to next/previous pages when applicable
 */
function twentyeleven_content_nav( $nav_id ) {
	global $wp_query;

	if ( $wp_query->max_num_pages > 1 ) : ?>
		<nav id="<?php echo $nav_id; ?>">
      <div class="nav-previous"><?php next_posts_link('<span class="meta-nav">«</span> Older posts'); ?></div>
			<div class="nav-next"><?php previous_posts_link('Newer posts <span class="meta-nav">»</span>'); ?></div>
		</nav><!-- #nav-above -->
	<?php endif;
}
?>